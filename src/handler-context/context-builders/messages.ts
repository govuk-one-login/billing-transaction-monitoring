import { S3Event, SQSEvent } from "aws-lambda";
import { HandlerCtx } from "..";
import { fetchS3 } from "../../shared/utils";
import { ConfigFileNames } from "../config/types";

enum EventTypes {
  SQS,
  S3,
}

// N.B. this is an adaptor from SQSEvents to domain messages
export const addSQSMessagesToCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  { Records }: SQSEvent,
  messageTypeGuard: (maybeMessage: any) => maybeMessage is TMessage,
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> => {
  const messages = Records.map<
    HandlerCtx<TMessage, TEnvVars, TConfigFileNames>["messages"][0]
  >(({ messageId: _id, body: rawBody }) => {
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      ctx.logger.error(`Received a message whose body was not valid JSON`);
      throw new Error(`Could not process message ${_id}`);
    }
    const messageIsExpectedType = messageTypeGuard(body);
    if (!messageIsExpectedType) {
      ctx.logger.error(
        `Received a message which did not conform to the expected type`
      );
      throw new Error(`Could not process message ${_id}`);
    }
    // we attach the _id to the message so that we can handle batch item failures
    return { ...body, _id };
  });
  return { ...ctx, messages };
};

const addS3MessagesToCtx = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  { Records }: S3Event,
  _messageTypeGuard: (maybeMessage: any) => maybeMessage is TMessage,
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): Promise<HandlerCtx<TMessage, TEnvVars, TConfigFileNames>> => {
  const promises = Records.map(
    async ({
      s3: {
        bucket: { name },
        object: { key },
      },
    }) => await fetchS3(name, key)
  );
  const resolutions = await Promise.allSettled(promises);
  const messages = resolutions.map<
    HandlerCtx<string, TEnvVars, TConfigFileNames>["messages"][0]
  >((resolution) => {
    if (resolution.status === "rejected") {
      throw new Error("The document this event pertains to could not be found");
    }
    return resolution.value;
  });
  return { ...ctx, messages: messages as TMessage[] };
};

const discernEventType = (event: S3Event | SQSEvent): EventTypes => {
  if ((event as S3Event).Records[0]?.s3) return EventTypes.S3;
  if ((event as SQSEvent).Records[0]?.messageId) return EventTypes.SQS; // would you believe that SQS is the only service to have messageIds?
  throw new Error("Event type could not be determined");
};

export const addMessagesToCtx = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  event: S3Event | SQSEvent,
  messageTypeGuard: (maybeMessage: any) => maybeMessage is TMessage,
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): Promise<HandlerCtx<TMessage, TEnvVars, TConfigFileNames>> => {
  switch (discernEventType(event)) {
    case EventTypes.S3:
      return await addS3MessagesToCtx(event as S3Event, messageTypeGuard, ctx);
    case EventTypes.SQS:
      return addSQSMessagesToCtx(event as SQSEvent, messageTypeGuard, ctx);
  }
};
