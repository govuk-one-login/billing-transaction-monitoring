import { generateRandomId, validTimestamp } from "./commonHelpers";

export enum ClientId {
  client1 = "client1",
  client2 = "client2",
  client3 = "client3",
  client4 = "client4",
}

export enum EventName {
  IPV_PASSPORT_CRI_REQUEST_SENT = "IPV_PASSPORT_CRI_REQUEST_SENT",
  IPV_FRAUD_CRI_REQUEST_SENT = "IPV_FRAUD_CRI_REQUEST_SENT",
  IPV_KBV_CRI_REQUEST_SENT = "IPV_KBV_CRI_REQUEST_SENT",
  IPV_ADDRESS_CRI_END = "IPV_ADDRESS_CRI_END",
}

export interface SNSEventPayload {
  event_name: EventName;
  event_id: string;
  component_id: string;
  timestamp: number;
  client_id: ClientId;
}

export const prettyClientNameMap = {
  client1: "Client One",
  client2: "Client Two",
  client3: "Client Three",
  client4: "Client Four",
};

export const prettyEventNameMap = {
  IPV_PASSPORT_CRI_REQUEST_SENT: "Passport check",
  IPV_FRAUD_CRI_REQUEST_SENT: "Fraud check",
  IPV_KBV_CRI_REQUEST_SENT: "Kbv check",
  IPV_ADDRESS_CRI_END: "Address check",
};

const snsValidEventPayload: SNSEventPayload = {
  event_name: EventName.IPV_PASSPORT_CRI_REQUEST_SENT,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  client_id: ClientId.client1,
};

const snsEventWithAdditionalFieldsPayload: SNSEventPayload = {
  event_name: EventName.IPV_PASSPORT_CRI_REQUEST_SENT,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  someUnwantedField: "some value",
  client_id: ClientId.client1,
} as unknown as SNSEventPayload;

const snsInvalidEventNamePayload: SNSEventPayload = {
  event_name: "TESTGGHYJKIK" as EventName,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  client_id: ClientId.client1,
};

const snsInvalidTimeStampPayload: SNSEventPayload = {
  event_name: EventName.IPV_PASSPORT_CRI_REQUEST_SENT,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: "somestring" as unknown as number,
  client_id: ClientId.client1,
};

const snsMissingEventNamePayload: SNSEventPayload = {
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  client_id: ClientId.client1,
} as unknown as SNSEventPayload;

const snsEventMissingTimestampPayload: SNSEventPayload = {
  event_name: EventName.IPV_PASSPORT_CRI_REQUEST_SENT,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  client_id: ClientId.client1,
} as unknown as SNSEventPayload;

const snsEventMissingCompIdPayload: SNSEventPayload = {
  event_name: EventName.IPV_PASSPORT_CRI_REQUEST_SENT,
  event_id: generateRandomId(),
  timestamp: validTimestamp(),
  client_id: ClientId.client1,
} as unknown as SNSEventPayload;

const snsMissingEventIdPayload: SNSEventPayload = {
  event_name: EventName.IPV_PASSPORT_CRI_REQUEST_SENT,
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  client_id: ClientId.client1,
} as unknown as SNSEventPayload;

const snsEventInvalidCompId: SNSEventPayload = {
  event_name: EventName.IPV_PASSPORT_CRI_REQUEST_SENT,
  event_id: generateRandomId(),
  component_id: 5678 as unknown as string,
  timestamp: validTimestamp(),
  client_id: ClientId.client1,
};

const snsEventMissingEventIdValue: SNSEventPayload = {
  event_name: EventName.IPV_PASSPORT_CRI_REQUEST_SENT,
  event_id: null as unknown as string,
  component_id: 5678 as unknown as string,
  timestamp: validTimestamp(),
  client_id: ClientId.client1,
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
