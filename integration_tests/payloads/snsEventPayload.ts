const generateRandomNumber = () => {
  return Math.floor(Math.random() * 10000000).toString();
};

const snsValidEventPayload = {
  event_name: "EVENT_1",
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  timestamp: new Date().getTime(),
};

const snsEventWithAdditionalFieldsPayload = {
  event_name: "EVENT_1",
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  timestamp: new Date().getTime(),
  someUnwantedField: "some value",
};

const snsInvalidEventNamePayload = {
  event_name: "TESTGGHYJKIK",
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  timestamp: new Date().getTime(),
};

const snsInvalidTimeStampPayload = {
  event_name: "EVENT_1",
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  timestamp: "somestring",
};

const snsMissingEventNamePayload = {
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
  timestamp: new Date().getTime(),
};

const snsEventMissingTimestampPayload = {
  event_name: "EVENT_1",
  event_id: generateRandomNumber(),
  component_id: "TEST_COMP",
};

const snsEventMissingCompIdPayload = {
  event_name: "EVENT_1",
  event_id: generateRandomNumber(),
  timestamp: new Date().getTime(),
};

const snsMissingEventIdPayload = {
  event_name: "EVENT_1",
  component_id: "TEST_COMP",
  timestamp: new Date().getTime(),
};

const snsEventInvalidCompId = {
  event_name: "EVENT_1",
  event_id: generateRandomNumber(),
  component_id: 5678,
  timestamp: new Date().getTime(),
};

const snsEventMisisingEventIdValue = {
  event_name: "EVENT_1",
  event_id: null,
  component_id: 5678,
  timestamp: new Date().getTime(),
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
