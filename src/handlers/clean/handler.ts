import { SQSEvent, SQSRecord } from "aws-lambda";
import AWS from "aws-sdk";
import { VALID_EVENT_NAMES } from "../../shared/constants";
import { ValidEventName } from "../../shared/types";
import { sendRecord } from "../../shared/utils";

type CleanedEventBodyObject = {
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
};

const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
type Response = { batchItemFailures: { itemIdentifier: string }[] };

export const handler = async (event: SQSEvent) => {
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

async function cleanRecord(record: SQSRecord) {
  const bodyObject = JSON.parse(record.body);
  console.log(bodyObject);
  if (
    typeof bodyObject?.component_id !== "string" ||
    !VALID_EVENT_NAMES.has(bodyObject?.event_name) ||
    typeof bodyObject?.timestamp !== "number"
  ) {
    const message = "Invalid record body.";
    console.error(message);
    throw new Error(message);
  }

  if (!process.env.OUTPUT_QUEUE_URL) {
    const message = "Output queue URL not set.";
    console.error(message);
    throw new Error(message);
  }

  const {
    client_id,
    component_id,
    event_id,
    event_name,
    extensions,
    timestamp,
    timestamp_formatted,
    user,
  } = bodyObject;

  const cleanedBodyObject: CleanedEventBodyObject = {
    client_id: typeof client_id === "string" ? client_id : undefined,
    component_id,
    event_id: typeof event_id == "string" ? event_id : undefined,
    event_name,
    extensions:
      typeof extensions === "object"
        ? {
            iss:
              typeof extensions.iss === "string" ? extensions.iss : undefined,
          }
        : undefined,
    timestamp,
    timestamp_formatted:
      typeof timestamp_formatted === "string" ? timestamp_formatted : undefined,
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

  await sendRecord({
    queueUrl:
      process.env.AWS_ENV === "local"
        ? process.env.OUTPUT_QUEUE_URL.replace(
            /^http\:\/\/localhost\:/,
            `http://${process.env.LOCALSTACK_HOSTNAME}:`
          )
        : process.env.OUTPUT_QUEUE_URL,
    record: {
      ...record,
      body: JSON.stringify(cleanedBodyObject),
    },
    sqs,
  });
}
