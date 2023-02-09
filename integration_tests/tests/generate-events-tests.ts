import { PublishBatchRequestEntry } from "@aws-sdk/client-sns";
import { writeFileSync } from "fs";
import { join } from "path";
import {
  VendorId,
  EventName,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";

const createPublishBatchRequestEntry = (
  numberOfEvents: number,
  vendorId: VendorId,
  eventName: EventName,
  eventTime: number
): PublishBatchRequestEntry[] => {
  return new Array(numberOfEvents).map((_, i) => ({
    Id: "message_" + (10000 + i).toString(36),
    Message: JSON.stringify({
      vendor_id: vendorId,
      component_id: "Test_COMP",
      event_id: "event_" + (10000 + i).toString(36),
      timestamp: eventTime,
      event_name: eventName,
    }),
  }));
};

describe("\nGENERATE EVENTS\n", () => {
  test("S3 EVENTS", async () => {
    const messages = createPublishBatchRequestEntry(
      11598,
      VendorId.vendor_testvendor1,
      EventName.EVENT_1,
      1672572427
    );
    writeFileSync(
      join(__dirname, "../payloads/messages.json"),
      JSON.stringify(messages)
    );
  });
});
