import { SQSEvent, SQSRecord } from "aws-lambda";
import { Response } from "../../shared/types";
import { logger, sendRecord } from "../../shared/utils";
import { fetchVendorId } from "../../shared/utils/config-utils/fetch-vendor-id";

interface CleanedEventBodyObject {
  vendor_id: string;
  component_id: string;
  event_id: string;
  event_name: string;
  timestamp: number;
  timestamp_formatted: string;
  user?: {
    transaction_id?: string;
  };
}

type IncomingEventBody = Omit<CleanedEventBodyObject, "vendor_id"> & {
  vendor_id?: string;
};

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

  if (!isValidBodyObject(bodyObject)) {
    logger.error("Event record body is invalid.");
    throw new Error("Event record body is invalid.");
  }

  const outputQueueUrl = process.env.OUTPUT_QUEUE_URL;
  if (outputQueueUrl === undefined || outputQueueUrl.length === 0)
    throw new Error("No OUTPUT_QUEUE_URL defined in this environment");

  const vendorId = bodyObject.vendor_id
    ? bodyObject.vendor_id
    : await fetchVendorId(bodyObject.event_name);

  const cleanedBodyObject: CleanedEventBodyObject = {
    component_id: bodyObject.component_id,
    event_name: bodyObject.event_name,
    timestamp: bodyObject.timestamp * 1000,
    event_id: bodyObject.event_id,
    timestamp_formatted: bodyObject.timestamp_formatted,
    vendor_id: vendorId,
    user: {
      transaction_id: bodyObject?.user?.transaction_id,
    },
  };

  logger.info(`Cleaned event ${cleanedBodyObject.event_id}`);
  await sendRecord(outputQueueUrl, JSON.stringify(cleanedBodyObject));
}

const isValidBodyObject = (x: any): x is IncomingEventBody =>
  typeof x === "object" &&
  typeof x.component_id === "string" &&
  typeof x.event_id === "string" &&
  typeof x.timestamp === "number" &&
  typeof x.timestamp_formatted === "string" &&
  typeof x.event_name === "string";
