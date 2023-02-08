import { EventName, ClientId } from "./payloadHelper";
import { publishToTestTopic } from "./snsHelper";

const generateS3Events = async (
  numberOfEvents: number,
  clientId: string,
  eventName: string,
  timeStamp: number
): Promise<void> => {
  const eventId = "event_" + (10000 + numberOfEvents).toString(36);
  const json = {
    client_id: clientId,
    component_id: "Test_COMP",
    event_id: eventId,
    timestamp: timeStamp,
    event_name: eventName,
  };
  console.log(json);
  const res = await publishToTestTopic(json);
  console.log(res);
};

await generateS3Events(
  3,
  ClientId.vendor_testvendor1,
  EventName.EVENT_1,
  1672572427
);
