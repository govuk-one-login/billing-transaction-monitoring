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

type UncheckedHandlerIncomingMessage =
  HandlerIncomingMessage<HandlerMessageBody> & {
    body: unknown;
  };

interface UncheckedResult extends Result<HandlerMessageBody> {
  incomingMessages: UncheckedHandlerIncomingMessage[];
}

const makeSQSMessages = (
  { Records }: SQSEvent,
  logger: Logger
): UncheckedResult => {
  const incomingMessages: UncheckedHandlerIncomingMessage[] = [];
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
}: S3Event): Promise<UncheckedHandlerIncomingMessage[]> => {
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
const makeS3MessagesFromSqsMessages = async (
  sqsResult: UncheckedResult,
  logger: Logger
): Promise<UncheckedResult> => {
  const failedIds = [...sqsResult.failedIds];
  const incomingMessages: UncheckedHandlerIncomingMessage[] = [];
  for (const { id, body } of sqsResult.incomingMessages) {
    try {
      const s3Messages = await makeS3Messages(body as S3Event);
      const s3MessagesWithIds = s3Messages.map((s3Message) => ({
        id,
        body: s3Message.body,
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
  result: UncheckedResult,
  incomingMessageBodyTypeGuard: (maybeBody: unknown) => maybeBody is TBody,
  logger: Logger
): Result<TBody> => {
  const validIncomingMessages: Array<HandlerIncomingMessage<TBody>> = [];
  const failedIds: string[] = [...result.failedIds];

  for (const incomingMessage of result.incomingMessages) {
    const bodyIsExpectedType = incomingMessageBodyTypeGuard(
      incomingMessage.body
    );
    if (bodyIsExpectedType) {
      validIncomingMessages.push(
        incomingMessage as HandlerIncomingMessage<TBody>
      );
    } else {
      logger.error(ERROR_MESSAGE_TYPE_GUARD, {
        messageId: incomingMessage.id,
      });
      if (incomingMessage.id === undefined) {
        throw new Error(ERROR_MESSAGE_MISSING_ID);
      } else {
        if (!failedIds.includes(incomingMessage.id))
          failedIds.push(incomingMessage.id);
      }
    }
  }

  const expectedResult = {
    incomingMessages: validIncomingMessages,
    failedIds,
  };

  return expectedResult;
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
  let result: Result<HandlerMessageBody>;
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

  const validatedResult = validateIncomingMessages<TBody>(
    result,
    incomingMessageBodyTypeGuard,
    logger
  );

  if (!failuresAllowed && validatedResult.failedIds.length > 0) {
    throw new Error(ERROR_MESSAGE_DEFAULT);
  }
  return validatedResult;
};
