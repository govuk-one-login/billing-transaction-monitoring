import { Logger } from "@aws-lambda-powertools/logger";
import { S3Event, SQSEvent } from "aws-lambda";
import { fetchS3 } from "../../../../shared/utils";

const makeCtxSQSMessages = <TMessage>(
  { Records }: SQSEvent,
  messageTypeGuard: (maybeMessage: unknown) => maybeMessage is TMessage,
  logger: Logger
): TMessage[] => {
  const messages = Records.map<TMessage>(
    ({ messageId: _id, body: rawBody }) => {
      let body;
      try {
        body = JSON.parse(rawBody);
      } catch (error) {
        logger.error(`Received a message whose body was not valid JSON`);
        throw new Error(`Failed to parse message ${_id} as JSON`);
      }
      const messageIsExpectedType = messageTypeGuard(body);
      if (!messageIsExpectedType) {
        logger.error(
          `Received a message which did not conform to the expected type`
        );
        throw new Error(`Message ${_id} did not conform to the expected type`);
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
        bucket: { name: bucketName },
        object: { key },
      },
    }) => await fetchS3(bucketName, key)
  );
  const resolutions = await Promise.allSettled(promises);
  const messages = resolutions.map<TMessage>((resolution) => {
    if (resolution.status === "rejected") {
      throw new Error("The object this event references could not be found.");
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

const isS3Event = (event: any): event is S3Event =>
  !!(event as S3Event).Records[0]?.s3;
const isSQSEvent = (event: any): event is SQSEvent =>
  !!(event as SQSEvent).Records[0]?.messageId;

export const makeCtxMessages = async <TMessage>(
  event: S3Event | SQSEvent,
  messageTypeGuard: (maybeMessage: any) => maybeMessage is TMessage,
  logger: Logger
): Promise<TMessage[]> => {
  if (isS3Event(event)) return await makeCtxS3Messages(event);
  if (isSQSEvent(event))
    return makeCtxSQSMessages(event, messageTypeGuard, logger);
  throw new Error("Event type could not be determined");
};
