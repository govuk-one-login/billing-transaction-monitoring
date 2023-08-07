import { validCleanedEventPayload } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { sendEventAndVerifyInDataStore } from "../../src/handlers/int-test-support/helpers/testDataHelper";
import { Queue } from "../../src/handlers/int-test-support/helpers/sqsHelper";

describe("\n Store function test\n", () => {
  test("should store cleaned events in the storage bucket", async () => {
    const result = await sendEventAndVerifyInDataStore(
      validCleanedEventPayload,
      Queue.STORAGE
    );
    expect(result.success).toBe(true);
    expect(result.eventId).toBe(validCleanedEventPayload.event_id);
  });
});
