import { SQSEvent, SQSRecord } from "aws-lambda";
import { SqsQueue } from "../driven/sqs-queue";
import { VendorServiceConfigStore } from "../driven/vendor-service-config";
import { Response } from "../shared/types";

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

interface HandlerDeps {
  vendorServiceConfigStore: VendorServiceConfigStore;
  sqsQueue: SqsQueue;
}

interface CleanRecordDeps {
  vendorServiceConfigStore: VendorServiceConfigStore;
}

export const cleanEventAdapter =
  ({ vendorServiceConfigStore, sqsQueue }: HandlerDeps) =>
  async (event: SQSEvent): Promise<Response> => {
    const outputQueueUrl = process.env.OUTPUT_QUEUE_URL;
    if (outputQueueUrl === undefined || outputQueueUrl.length === 0)
      throw new Error("No OUTPUT_QUEUE_URL defined in this environment");

    const response: Response = { batchItemFailures: [] };
    const cleanEvent = cleanEventFactory({ vendorServiceConfigStore });

    const promises = event.Records.map(async (record) => {
      try {
        const cleanedBodyObject = await cleanEvent(record);
        await sqsQueue.sendRecord(
          outputQueueUrl,
          JSON.stringify(cleanedBodyObject)
        );
      } catch (e) {
        response.batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    });

    await Promise.all(promises);
    return response;
  };

// TODO tidy this part up into a model passed in to the clean event adapter
const cleanEventFactory =
  ({ vendorServiceConfigStore }: CleanRecordDeps) =>
  async (record: SQSRecord): Promise<CleanedEventBodyObject> => {
    const bodyObject = JSON.parse(record.body);

    if (!isValidBodyObject(bodyObject)) {
      console.error("Event record body is invalid.");
      console.log(bodyObject);
      throw new Error("Event record body is invalid.");
    }

    const vendorId = bodyObject.vendor_id
      ? bodyObject.vendor_id
      : await vendorServiceConfigStore.getVendorIdByEventName(
          bodyObject.event_name
        );

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

    console.log("Cleaned event ", cleanedBodyObject.event_id);

    return cleanedBodyObject;
  };

const isValidBodyObject = (x: any): x is IncomingEventBody =>
  typeof x === "object" &&
  typeof x.component_id === "string" &&
  typeof x.event_id === "string" &&
  typeof x.timestamp === "number" &&
  typeof x.timestamp_formatted === "string" &&
  typeof x.event_name === "string";
