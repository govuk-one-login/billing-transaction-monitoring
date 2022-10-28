import { SQSEvent, SQSRecord } from "aws-lambda";
import { VALID_EVENT_NAMES } from "../../shared/constants";
import { ValidEventName } from "../../shared/types";
import { sendRecord } from "../../shared/utils";

interface CleanedEventBodyObject {
  client_id?: string;
  component_id: string;
  event_id?: string;
  event_name: ValidEventName;
  extensions?: {
    iss?: string;
  };
  timestamp: number;
  timestamp_formatted?: string;
  user?: {
    transaction_id?: string;
  };
}

interface Response {
  batchItemFailures: Array<{ itemIdentifier: string }>;
}

export const handler = async (event: SQSEvent): Promise<Response> => {
  const response: Response = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await cleanRecord(record);
    } catch (e) {
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

async function cleanRecord(record: SQSRecord): Promise<void> {
  const bodyObject = JSON.parse(record.body);
  if (
    typeof bodyObject?.component_id !== "string" ||
    !VALID_EVENT_NAMES.has(bodyObject?.event_name) ||
    typeof bodyObject?.timestamp !== "number"
  ) {
    const message = "Invalid record body.";
    console.error(message);
    throw new Error(message);
  }

  if (
    process.env.OUTPUT_QUEUE_URL === undefined ||
    process.env.OUTPUT_QUEUE_URL.length === 0
  ) {
    const message = "Output queue URL not set.";
    console.error(message);
    throw new Error(message);
  }

  const {
    client_id: clientId,
    component_id: componentId,
    event_id: eventId,
    event_name: eventName,
    extensions,
    timestamp,
    timestamp_formatted: timestampFormatted,
    user,
  } = bodyObject;

  const cleanedBodyObject: CleanedEventBodyObject = {
    client_id: typeof clientId === "string" ? clientId : undefined,
    component_id: componentId,
    event_id: typeof eventId === "string" ? eventId : undefined,
    event_name: eventName,
    extensions:
      typeof extensions === "object"
        ? {
            iss:
              typeof extensions.iss === "string" ? extensions.iss : undefined,
          }
        : undefined,
    timestamp,
    timestamp_formatted:
      typeof timestampFormatted === "string" ? timestampFormatted : undefined,
    user:
      typeof user === "object"
        ? {
            transaction_id:
              typeof user.transaction_id === "string"
                ? user.transaction_id
                : undefined,
          }
        : undefined,
  };

  await sendRecord(
    process.env.OUTPUT_QUEUE_URL,
    JSON.stringify(cleanedBodyObject)
  );
}
