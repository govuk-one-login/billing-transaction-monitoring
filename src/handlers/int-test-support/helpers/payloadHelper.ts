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
  vendor_id: VendorId;
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
  VENDOR_2_EVENT_7: "Kbv check",
  VENDOR_3_EVENT_6: "Address check",
};

const snsValidEventPayload: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
};

const snsEventWithAdditionalFieldsPayload: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  someUnwantedField: "some value",
  vendor_id: VendorId.vendor_testvendor1,
} as unknown as SNSEventPayload;

const snsInvalidEventNamePayload: SNSEventPayload = {
  event_name: "TESTGGHYJKIK" as EventName,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
};

const snsInvalidTimeStampPayload: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: "somestring" as unknown as number,
  vendor_id: VendorId.vendor_testvendor1,
};

const snsMissingEventNamePayload: SNSEventPayload = {
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
} as unknown as SNSEventPayload;

const snsEventMissingTimestampPayload: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  vendor_id: VendorId.vendor_testvendor1,
} as unknown as SNSEventPayload;

const snsEventMissingCompIdPayload: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
} as unknown as SNSEventPayload;

const snsMissingEventIdPayload: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
} as unknown as SNSEventPayload;

const snsEventInvalidCompId: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: 5678 as unknown as string,
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
};

const snsEventMissingEventIdValue: SNSEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: null as unknown as string,
  component_id: 5678 as unknown as string,
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
};

export {
  snsValidEventPayload,
  snsInvalidEventNamePayload,
  snsMissingEventIdPayload,
  snsEventMissingCompIdPayload,
  snsEventInvalidCompId,
  snsInvalidTimeStampPayload,
  snsEventMissingTimestampPayload,
  snsEventWithAdditionalFieldsPayload,
  snsMissingEventNamePayload,
  snsEventMissingEventIdValue,
  generateRandomId,
};
