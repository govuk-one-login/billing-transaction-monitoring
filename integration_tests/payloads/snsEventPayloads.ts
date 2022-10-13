
const generateRandomNumber = () => {
  return Math.floor(Math.random() * 10000000).toString()
}

const snsValidEventPayload = {
    event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
    event_id: generateRandomNumber(),
    component_id: "TEST_COMP",
    timestamp: new Date().getTime()
  };

  const snsEventWithAdditionalFieldsPayload = {
    event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
    event_id: generateRandomNumber(),
    component_id: "TEST_COMP",
    timestamp: new Date().getTime(),
    someUnwantedField: "some value",
  };

  const snsInvalidEventNamePayload = {
    event_name: "TESTGGHYJKIK",
    event_id: generateRandomNumber(),
    component_id: "TEST_COMP",
    timestamp: new Date().getTime()
  };

  const snsMissingEventNamePayload = {
    event_id: generateRandomNumber(),
    component_id: "TEST_COMP",
    timestamp: new Date().getTime()
  };

  const snsEventMissingTimestampPayload = {
    event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
    event_id: generateRandomNumber(),
    component_id: "TEST_COMP"
  };

  const snsEventMissingCompIdPayload = {
    event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
    event_id: generateRandomNumber(),
    timestamp: new Date().getTime()
  };

  const snsEventInvalidCompId = {
    event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
    event_id: generateRandomNumber(),
    component_id: 5678,
    timestamp: new Date().getTime()
  };

  export { snsValidEventPayload,snsInvalidEventNamePayload, 
    snsEventMissingCompIdPayload,snsEventInvalidCompId,
    snsEventMissingTimestampPayload,snsEventWithAdditionalFieldsPayload,snsMissingEventNamePayload}