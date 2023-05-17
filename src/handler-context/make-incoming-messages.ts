import { Logger } from "@aws-lambda-powertools/logger";
import { S3Event, SQSEvent } from "aws-lambda";
import { fetchS3 } from "../shared/utils";
import { HandlerIncomingMessage, HandlerMessageBody } from "./types";

const ERROR_MESSAGE_DEFAULT = "Failed to make message";
const ERROR_MESSAGE_TYPE_GUARD = "Message did not conform to the expected type";

const makeSQSMessages = <TBody extends HandlerMessageBody>(
  { Records }: SQSEvent,
  incomingMessageBodyTypeGuard: (maybeBody: unknown) => maybeBody is TBody,
  logger: Logger
): {
  incomingMessages: Array<HandlerIncomingMessage<TBody>>;
  failedIds: string[];
} => {
  const incomingMessages: Array<HandlerIncomingMessage<TBody>> = [];
  const failedIds: string[] = [];
  console.log("Make SQS Message Records ", Records);

  for (const { messageId: id, body: rawBody } of Records) {
    try {
      const body = JSON.parse(rawBody);
      const bodyIsExpectedType = incomingMessageBodyTypeGuard(body);
      if (!bodyIsExpectedType) throw new Error(ERROR_MESSAGE_TYPE_GUARD);
      incomingMessages.push({ id, body });
    } catch (error) {
      logger.error(ERROR_MESSAGE_DEFAULT, { error, messageId: id });
      failedIds.push(id);
    }
  }

  return { incomingMessages, failedIds };
};

const makeS3Messages = async <TBody extends HandlerMessageBody>(
  { Records }: S3Event,
  incomingMessageBodyTypeGuard: (maybeBody: unknown) => maybeBody is TBody
): Promise<Array<HandlerIncomingMessage<TBody>>> => {
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
    const bodyIsExpectedType = incomingMessageBodyTypeGuard(body);
    if (!bodyIsExpectedType) {
      throw new Error(ERROR_MESSAGE_TYPE_GUARD);
    }
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

const SQSMessageIncludesS3EventRecord = (result: {
  incomingMessages: Array<HandlerIncomingMessage<any>>;
  failedIds: string[];
}): boolean => {
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
): Promise<{
  incomingMessages: Array<HandlerIncomingMessage<TBody>>;
  failedIds: string[];
}> => {
  let result: {
    incomingMessages: Array<HandlerIncomingMessage<TBody>>;
    failedIds: string[];
  };
  if (isSQSEvent(event)) {
    result = makeSQSMessages(event, incomingMessageBodyTypeGuard, logger);
    if (SQSMessageIncludesS3EventRecord(result)) {
      result = {
        incomingMessages: await makeS3Messages(
          result.incomingMessages[0].body as unknown as S3Event,
          incomingMessageBodyTypeGuard
        ),
        failedIds: [], // S3 events have no message IDs (throw error on failure instead)}
      };
    }
  } else {
    result = {
      incomingMessages: await makeS3Messages(
        event,
        incomingMessageBodyTypeGuard
      ),
      failedIds: [], // S3 events have no message IDs (throw error on failure instead)}
    };
  }

  if (!failuresAllowed && result.failedIds.length > 0)
    throw new Error(ERROR_MESSAGE_DEFAULT);
  console.log("final result", result);
  return result;
};
