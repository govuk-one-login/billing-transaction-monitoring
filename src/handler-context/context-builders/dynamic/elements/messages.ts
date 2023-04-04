import { Logger } from "@aws-lambda-powertools/logger";
import { S3Event, SQSEvent } from "aws-lambda";
import { fetchS3 } from "../../../../shared/utils";

enum EventTypes {
  SQS,
  S3,
}

const makeCtxSQSMessages = <TMessage>(
  { Records }: SQSEvent,
  messageTypeGuard: (maybeMessage: any) => maybeMessage is TMessage,
  logger: Logger
): TMessage[] => {
  const messages = Records.map<TMessage>(
    ({ messageId: _id, body: rawBody }) => {
      let body;
      try {
        body = JSON.parse(rawBody);
      } catch (error) {
        logger.error(`Received a message whose body was not valid JSON`);
        throw new Error(`Could not process message ${_id}`);
      }
      const messageIsExpectedType = messageTypeGuard(body);
      if (!messageIsExpectedType) {
        logger.error(
          `Received a message which did not conform to the expected type`
        );
        throw new Error(`Could not process message ${_id}`);
      }
      // we attach the _id to the message so that we can handle batch item failures
      return { ...body, _id };
    }
  );
  return messages;
};

const makeCtxS3Messages = async <TMessage>({
  Records,
}: S3Event): Promise<TMessage[]> => {
  const promises = Records.map(
    async ({
      s3: {
        bucket: { name },
        object: { key },
      },
    }) => await fetchS3(name, key)
  );
  const resolutions = await Promise.allSettled(promises);
  const messages = resolutions.map<TMessage>((resolution) => {
    if (resolution.status === "rejected") {
      throw new Error("The document this event pertains to could not be found");
    }
    // This coercion negates an issue that stems from further up.
    // I think we need some way for the dev writing the handler
    // to specify which kind of event they're expecting it to
    // be invoked with. That way we can ditch the vestigial
    // message type guards for the s3 events. I did have some
    // quite blue sky ideas about being able to interpret this
    // from the cloudformation yaml but that would require a
    // preprocessor to generate expected types.
    return resolution.value as TMessage;
  });
  return messages;
};

const discernEventType = (event: S3Event | SQSEvent): EventTypes => {
  if ((event as S3Event).Records[0]?.s3) return EventTypes.S3;
  if ((event as SQSEvent).Records[0]?.messageId) return EventTypes.SQS;
  throw new Error("Event type could not be determined");
};

export const makeCtxMessages = async <TMessage>(
  event: S3Event | SQSEvent,
  messageTypeGuard: (maybeMessage: any) => maybeMessage is TMessage,
  logger: Logger
): Promise<TMessage[]> => {
  switch (discernEventType(event)) {
    case EventTypes.S3:
      return await makeCtxS3Messages(event as S3Event);
    case EventTypes.SQS:
      return makeCtxSQSMessages(event as SQSEvent, messageTypeGuard, logger);
  }
};
