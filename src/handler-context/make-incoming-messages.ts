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
  const messages = resolutions.map((resolution) => {
    if (resolution.status === "rejected") {
      throw new Error("The object this event references could not be found.");
    }
    const body = resolution.value;
    const bodyIsExpectedType = incomingMessageBodyTypeGuard(body);
    if (!bodyIsExpectedType) {
      throw new Error(ERROR_MESSAGE_TYPE_GUARD);
    }
    return { body };
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

export const makeIncomingMessages = async <TBody extends HandlerMessageBody>(
  event: S3Event | SQSEvent,
  incomingMessageBodyTypeGuard: (maybeBody: any) => maybeBody is TBody,
  logger: Logger,
  failuresAllowed?: boolean
): Promise<{
  incomingMessages: Array<HandlerIncomingMessage<TBody>>;
  failedIds: string[];
}> => {
  const result = isSQSEvent(event)
    ? makeSQSMessages(event, incomingMessageBodyTypeGuard, logger)
    : {
        incomingMessages: await makeS3Messages(
          event,
          incomingMessageBodyTypeGuard
        ),
        failedIds: [], // S3 events have no message IDs (throw error on failure instead)
      };

  if (!failuresAllowed && result.failedIds.length > 0)
    throw new Error(ERROR_MESSAGE_DEFAULT);

  return result;
};
