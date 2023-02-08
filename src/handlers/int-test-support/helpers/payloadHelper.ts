import { generateRandomId, validTimestamp } from "./commonHelpers";

export enum VendorId {
  vendor_testvendor1 = "vendor_testvendor1",
  vendor_testvendor2 = "vendor_testvendor2",
  vendor_testvendor3 = "vendor_testvendor3",
  vendor_testvendor4 = "vendor_testvendor4",
}

export enum EventName {
  EVENT_1 = "EVENT_1",
  EVENT_3 = "EVENT_3",
  EVENT_7 = "EVENT_7",
  EVENT_6 = "EVENT_6",
}

export interface SNSEventPayload {
  event_name: EventName;
  event_id: string;
  component_id: string;
  timestamp: number;
  vendor_id: VendorId;
}

export const prettyClientNameMap = {
  vendor_testvendor1: "Client One",
  vendor_testvendor2: "Client Two",
  vendor_testvendor3: "Client Three",
  vendor_testvendor4: "Client Four",
};

export const prettyEventNameMap = {
  EVENT_1: "Passport check",
  EVENT_3: "Fraud check",
  EVENT_7: "Kbv check",
  EVENT_6: "Address check",
};

const snsValidEventPayload: SNSEventPayload = {
  event_name: EventName.EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
};

const snsEventWithAdditionalFieldsPayload: SNSEventPayload = {
  event_name: EventName.EVENT_1,
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
  event_name: EventName.EVENT_1,
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
  event_name: EventName.EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  vendor_id: VendorId.vendor_testvendor1,
} as unknown as SNSEventPayload;

const snsEventMissingCompIdPayload: SNSEventPayload = {
  event_name: EventName.EVENT_1,
  event_id: generateRandomId(),
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
} as unknown as SNSEventPayload;

const snsMissingEventIdPayload: SNSEventPayload = {
  event_name: EventName.EVENT_1,
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
} as unknown as SNSEventPayload;

const snsEventInvalidCompId: SNSEventPayload = {
  event_name: EventName.EVENT_1,
  event_id: generateRandomId(),
  component_id: 5678 as unknown as string,
  timestamp: validTimestamp(),
  vendor_id: VendorId.vendor_testvendor1,
};

const snsEventMissingEventIdValue: SNSEventPayload = {
  event_name: EventName.EVENT_1,
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
