import {
  VendorId,
  EventName,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { publishToTestTopic } from "../../src/handlers/int-test-support/helpers/snsHelper";

const generateS3Events = async (
  numberOfEvents: number,
  vendorId: VendorId,
  eventName: EventName,
  eventTime: number
): Promise<void> => {
  for (let i = 0; i < numberOfEvents; i++) {
    const eventId = "event_" + (10000 + i).toString(36);
    console.log(numberOfEvents);
    const json = {
      vendor_id: vendorId,
      component_id: "Test_COMP",
      event_id: eventId,
      timestamp: eventTime,
      event_name: eventName,
    };
    console.log(json);
    await publishToTestTopic(json);
  }
};

describe("\nGENERATE EVENTS\n", () => {
  test("S3 EVENTS", async () => {
    await generateS3Events(
      11598,
      VendorId.vendor_testvendor1,
      EventName.EVENT_1,
      1672572427
    );
  });
});
