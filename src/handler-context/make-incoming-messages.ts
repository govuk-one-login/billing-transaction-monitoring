import { Logger } from "@aws-lambda-powertools/logger";
import { S3Event, SQSEvent } from "aws-lambda";
import { fetchS3 } from "../shared/utils";
import { HandlerIncomingMessage, HandlerMessageBody } from "./types";

const ERROR_MESSAGE_DEFAULT = "Failed to make message";
const ERROR_MESSAGE_TYPE_GUARD = "Message did not conform to the expected type";

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

const makeS3Messages = async <TBody extends HandlerMessageBody>({
  Records,
}: S3Event): Promise<Array<HandlerIncomingMessage<TBody>>> => {
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
    const body = resolution.value as TBody;
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
  const { id, body } = sqsResult.incomingMessages[0];
  const failedIds = [...sqsResult.failedIds];
  const incomingMessages: Array<HandlerIncomingMessage<TBody>> = [];
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
    if (id !== undefined && !failedIds.includes(id)) failedIds.push(id);
  }

  return { incomingMessages, failedIds };
};

const isSQSEvent = (event: unknown): event is SQSEvent =>
  isEvent(event) && event.Records.every(isSqsRecord);

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

const SQSMessageIncludesS3EventRecord = (result: Result<S3Event>): boolean => {
  for (const incomingMessage of result.incomingMessages) {
    const { body } = incomingMessage;
    if (body.Records) {
      for (const record of body.Records) {
        if (record.s3) {
          return true;
        }
      }
    }
  }
  return false;
};

export const makeIncomingMessages = async <TBody extends HandlerMessageBody>(
  event: S3Event | SQSEvent,
  incomingMessageBodyTypeGuard: (maybeBody: any) => maybeBody is TBody,
  logger: Logger,
  failuresAllowed?: boolean
): Promise<Result<TBody>> => {
  let result: Result<TBody>;

  if (isSQSEvent(event)) {
    result = makeSQSMessages(event, logger);

    if (SQSMessageIncludesS3EventRecord(result)) {
      result = await makeS3MessagesFromSqsMessages(result, logger);
    }

    for (const incomingMessage of result.incomingMessages) {
      try {
        const bodyIsExpectedType = incomingMessageBodyTypeGuard(
          incomingMessage.body
        );
        if (!bodyIsExpectedType) {
          result.incomingMessages.pop();
          throw new Error(ERROR_MESSAGE_TYPE_GUARD);
        }
      } catch (error) {
        logger.error(ERROR_MESSAGE_DEFAULT, {
          error,
          messageId: incomingMessage.id,
        });
        if (incomingMessage.id) {
          result.failedIds.push(incomingMessage.id);
        }
      }
    }
    if (!failuresAllowed && result.failedIds.length > 0) {
      throw new Error(ERROR_MESSAGE_DEFAULT);
    }
  } else {
    result = {
      incomingMessages: await makeS3Messages(event),
      failedIds: [], // S3 events have no message IDs (throw error on failure instead)}
    };

    for (const incomingMessage of result.incomingMessages) {
      const bodyIsExpectedType = incomingMessageBodyTypeGuard(
        incomingMessage.body
      );
      if (!bodyIsExpectedType) {
        result.incomingMessages.pop();
        throw new Error(ERROR_MESSAGE_TYPE_GUARD);
      }
    }
  }

  return result;
};
