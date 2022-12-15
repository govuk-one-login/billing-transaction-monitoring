const generateRandomNumber = (): string => {
  return Math.floor(Math.random() * 10000000).toString();
};

const snsValidEventPayload = {
  event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  timestamp: new Date().getTime(),
  client_id: "client1",
};

const snsEventWithAdditionalFieldsPayload = {
  event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  timestamp: new Date().getTime(),
  someUnwantedField: "some value",
  client_id: "client1",
};

const snsInvalidEventNamePayload = {
  event_name: "TESTGGHYJKIK",
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  timestamp: new Date().getTime(),
  client_id: "client1",
};

const snsInvalidTimeStampPayload = {
  event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  timestamp: "somestring",
  client_id: "client1",
};

const snsMissingEventNamePayload = {
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  timestamp: new Date().getTime(),
  client_id: "client1",
};

const snsEventMissingTimestampPayload = {
  event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  client_id: "client1",
};

const snsEventMissingCompIdPayload = {
  event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
  event_id: generateRandomNumber(),
  timestamp: new Date().getTime(),
  client_id: "client1",
};

const snsMissingEventIdPayload = {
  event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
  component_id: "TEST_COMP",
  timestamp: new Date().getTime(),
  client_id: "client1",
};

const snsEventInvalidCompId = {
  event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
  event_id: generateRandomNumber(),
  component_id: 5678,
  timestamp: new Date().getTime(),
  client_id: "client1",
};

const snsEventMisisingEventIdValue = {
  event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
  event_id: null,
  component_id: 5678,
  timestamp: new Date().getTime(),
  client_id: "client1",
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
  snsEventMisisingEventIdValue,
};
