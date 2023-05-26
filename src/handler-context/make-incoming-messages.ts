import { Logger } from "@aws-lambda-powertools/logger";
import { S3Event, S3EventRecord, SQSEvent } from "aws-lambda";
import { fetchS3 } from "../shared/utils";
import { HandlerIncomingMessage, HandlerMessageBody } from "./types";

const ERROR_MESSAGE_DEFAULT = "Failed to make message";
const ERROR_MESSAGE_TYPE_GUARD = "Message did not conform to the expected type";
const ERROR_MESSAGE_MISSING_ID =
  "Message did not conform to the expected type and Incoming message does not have an id";

interface Result<TBody extends HandlerMessageBody> {
  incomingMessages: Array<HandlerIncomingMessage<TBody>>;
  failedIds: string[];
}

const makeSQSMessages = <TBody extends HandlerMessageBody>(
  { Records }: SQSEvent,
  logger: Logger
): Result<TBody> => {
  const incomingMessages: Array<HandlerIncomingMessage<TBody>> = [];
  const failedIds: string[] = [];
  for (const { messageId: id, body: rawBody } of Records) {
    try {
      const body = JSON.parse(rawBody);
      incomingMessages.push({ id, body });
    } catch (error) {
      logger.error(ERROR_MESSAGE_DEFAULT, { error, messageId: id });
      failedIds.push(id);
    }
  }
  return { incomingMessages, failedIds };
};
const makeS3Messages = async ({
  Records,
}: S3Event): Promise<Array<HandlerIncomingMessage<unknown>>> => {
  const promises = Records.map(
    async ({
      s3: {
        bucket: { name: bucketName },
        object: { key },
      },
    }) => await fetchS3(bucketName, key)
  );
  const resolutions = await Promise.allSettled(promises);
  const messages = resolutions.map((resolution, index) => {
    if (resolution.status === "rejected") {
      throw new Error("The object this event references could not be found.");
    }
    const body = resolution.value;
    return {
      body,
      meta: {
        bucketName: Records[index].s3.bucket.name,
        key: Records[index].s3.object.key,
      },
    };
  });
  return messages;
};
const makeS3MessagesFromSqsMessages = async <TBody extends HandlerMessageBody>(
  sqsResult: Result<TBody>,
  logger: Logger
): Promise<Result<TBody>> => {
  const failedIds = [...sqsResult.failedIds];
  const incomingMessages: Array<HandlerIncomingMessage<TBody>> = [];
  for (const { id, body } of sqsResult.incomingMessages) {
    try {
      const s3Messages = await makeS3Messages(body as S3Event);
      const s3MessagesWithIds = s3Messages.map((s3Message) => ({
        id,
        body: s3Message.body as TBody,
        meta: s3Message.meta,
      }));
      incomingMessages.push(...s3MessagesWithIds);
    } catch (error) {
      logger.error(ERROR_MESSAGE_DEFAULT, { error, messageId: id });
      if (id === undefined) {
        throw new Error(ERROR_MESSAGE_MISSING_ID);
      }
      if (!failedIds.includes(id)) failedIds.push(id);
    }
  }
  return { incomingMessages, failedIds };
};

const validateIncomingMessages = <TBody extends HandlerMessageBody>(
  { incomingMessages, failedIds }: Result<unknown>,
  isMessageBodyTBody: (maybeBody: unknown) => maybeBody is TBody,
  logger: Logger
): Result<TBody> => {
  const isHandlerIncomingMessageBodyTBody = (
    incomingMessage: HandlerIncomingMessage<unknown>
  ): incomingMessage is HandlerIncomingMessage<TBody> => {
    return isMessageBodyTBody(incomingMessage.body);
  };

  return incomingMessages.reduce<Result<TBody>>(
    (acc, incomingMessage) => {
      if (isHandlerIncomingMessageBodyTBody(incomingMessage)) {
        return {
          ...acc,
          incomingMessages: [...acc.incomingMessages, incomingMessage],
        };
      }
      logger.warn(ERROR_MESSAGE_TYPE_GUARD, {
        messageId: incomingMessage.id,
      });
      if (!incomingMessage.id) throw new Error(ERROR_MESSAGE_MISSING_ID);
      return {
        ...acc,
        failedIds: [...acc.failedIds, incomingMessage.id],
      };
    },
    {
      incomingMessages: [],
      failedIds,
    }
  );
};

const isSQSEvent = (event: unknown): event is SQSEvent =>
  isEvent(event) && event.Records.every(isSqsRecord);

const isS3EventInSQSEvent = (event: unknown): event is S3Event =>
  isEvent(event) && event.Records.every(isS3EventRecord);

const isEvent = (
  x: unknown
): x is {
  Records: Array<Record<string, unknown>>;
} =>
  isJsonObject(x) &&
  "Records" in x &&
  Array.isArray(x.Records) &&
  x.Records.every(isJsonObject);

const isJsonObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;

const isSqsRecord = (x: unknown): x is { messageId: unknown } =>
  isJsonObject(x) && "messageId" in x && !!x.messageId;

const isS3EventRecord = (x: unknown): x is S3EventRecord =>
  isJsonObject(x) && "s3" in x && !!x.s3;

const SQSMessageIncludesS3EventRecord = <TBody extends HandlerMessageBody>(
  result: Result<TBody>
): boolean =>
  result.incomingMessages.every(({ body }) => isS3EventInSQSEvent(body));

export const makeIncomingMessages = async <TBody extends HandlerMessageBody>(
  event: S3Event | SQSEvent,
  incomingMessageBodyTypeGuard: (maybeBody: any) => maybeBody is TBody,
  logger: Logger,
  failuresAllowed?: boolean
): Promise<Result<TBody>> => {
  let result;
  if (isSQSEvent(event)) {
    result = makeSQSMessages(event, logger);

    if (SQSMessageIncludesS3EventRecord(result)) {
      result = await makeS3MessagesFromSqsMessages(result, logger);
    }
  } else {
    result = {
      incomingMessages: await makeS3Messages(event),
      failedIds: [], // S3 events have no message IDs (throw error on failure instead)}
    };
  }

  result = validateIncomingMessages(
    result,
    incomingMessageBodyTypeGuard,
    logger
  );

  result.failedIds = Array.from(new Set(result.failedIds));

  if (!failuresAllowed && result.failedIds.length > 0) {
    throw new Error(ERROR_MESSAGE_DEFAULT);
  }
  return result;
};
