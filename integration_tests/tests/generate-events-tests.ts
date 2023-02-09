import { PublishBatchRequestEntry } from "@aws-sdk/client-sns";
import {
  VendorId,
  EventName,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { batchPublishToTestTopic } from "../../src/handlers/int-test-support/helpers/snsHelper";

const createPublishBatchRequestEntry = (
  numberOfEvents: number,
  vendorId: VendorId,
  eventName: EventName,
  eventTime: number
): PublishBatchRequestEntry[] => {
  const events = [];
  for (let i = 0; i < numberOfEvents; i++) {
    const eventId = "event_" + (10000 + i).toString(36);
    const message = JSON.stringify({
      vendor_id: vendorId,
      component_id: "Test_COMP",
      event_id: eventId,
      timestamp: eventTime,
      event_name: eventName,
    });
    events.push({ Id: eventId, Message: message });
  }
  return events;
};

describe("\nGENERATE EVENTS\n", () => {
  test("S3 EVENTS", async () => {
    const messages = createPublishBatchRequestEntry(
      11598,
      VendorId.vendor_testvendor1,
      EventName.EVENT_1,
      1672572427
    );
    try {
      await batchPublishToTestTopic(messages);
    } catch (e) {
      console.log(e);
    }
  });
});
