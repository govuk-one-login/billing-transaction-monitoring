import path from "path";
import fs from "fs";
import { generateRandomId, validTimestamp } from "./commonHelpers";

export enum VendorId {
  vendor_testvendor1 = "vendor_testvendor1",
  vendor_testvendor2 = "vendor_testvendor2",
  vendor_testvendor3 = "vendor_testvendor3",
  vendor_testvendor4 = "vendor_testvendor4",
}

export enum EventName {
  VENDOR_1_EVENT_1 = "VENDOR_1_EVENT_1",
  VENDOR_1_EVENT_3 = "VENDOR_1_EVENT_3",
  VENDOR_2_EVENT_7 = "VENDOR_2_EVENT_7",
  VENDOR_3_EVENT_6 = "VENDOR_3_EVENT_6",
}

export interface SNSEventPayload {
  event_name: EventName;
  event_id: string;
  component_id: string;
  timestamp: number;
  timestamp_formatted: string;
}

export const prettyVendorNameMap = {
  vendor_testvendor1: "Vendor One",
  vendor_testvendor2: "Vendor Two",
  vendor_testvendor3: "Vendor Three",
  vendor_testvendor4: "Vendor Four",
};

export const prettyEventNameMap = {
  VENDOR_1_EVENT_1: "Passport check",
  VENDOR_1_EVENT_3: "Fraud check",
  VENDOR_2_EVENT_2: "Passport check",
  VENDOR_2_EVENT_7: "Kbv check",
  VENDOR_3_EVENT_4: "Passport check",
  VENDOR_3_EVENT_6: "Address check",
  VENDOR_4_EVENT_5: "Passport check",
};

const snsValidEventPayload: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  timestamp_formatted: JSON.stringify(new Date(validTimestamp())),
};

const snsInvalidEventPayloadEventName: SNSEventPayload = {
  event_name: "TESTGGHYJKIK" as EventName,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  timestamp_formatted: JSON.stringify(new Date(validTimestamp())),
};

const snsInvalidEventPayloadTimeStamp: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: "somestring" as unknown as number,
  timestamp_formatted: JSON.stringify(new Date(validTimestamp())),
};

const snsInvalidEventPayloadComponentId: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: 5678 as unknown as string,
  timestamp: validTimestamp(),
  timestamp_formatted: JSON.stringify(new Date(validTimestamp())),
};

const snsInvalidEventPayloadEventId: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: 123 as unknown as string,
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  timestamp_formatted: JSON.stringify(new Date(validTimestamp())),
};

const snsInvalidEventPayloadTimestampFormatted: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  timestamp_formatted: 123 as unknown as string,
};

export const updateSQSEventPayloadBody = async (
  eventTime: string,
  eventName: string
): Promise<string> => {
  const eventPayload = {
    component_id: "Test_COMP",
    event_id: `e2eTestEvents_${generateRandomId()}`,
    timestamp: new Date(eventTime).getTime() / 1000,
    event_name: eventName,
    timestamp_formatted: eventTime,
  };
  console.log(eventPayload);

  // update SQS Event body value with eventPayload
  const sqsEventFilePath = path.join(
    __dirname,
    "../../../../integration_tests/payloads/validSQSEventPayload.json"
  );
  const sqsEventPayloadFileContent = fs.readFileSync(sqsEventFilePath, "utf-8");
  const sqsEventPayload = JSON.parse(sqsEventPayloadFileContent);
  sqsEventPayload.Records[0].body = JSON.stringify(eventPayload);
  const updatedSQSEventPayload = JSON.stringify(sqsEventPayload);
  return updatedSQSEventPayload;
};

export {
  snsValidEventPayload,
  snsInvalidEventPayloadEventName,
  snsInvalidEventPayloadComponentId,
  snsInvalidEventPayloadTimeStamp,
  snsInvalidEventPayloadEventId,
  snsInvalidEventPayloadTimestampFormatted,
  generateRandomId,
};
