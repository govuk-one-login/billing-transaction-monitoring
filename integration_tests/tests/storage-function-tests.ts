import { validCleanedEventPayload } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { invokeStorageLambdaAndVerifyEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

describe("\n Store function test\n", () => {
  test("should store cleaned version of events in the storage bucket", async () => {
    const result = await invokeStorageLambdaAndVerifyEventInS3Bucket(
      validCleanedEventPayload
    );
    expect(result.success).toBe(true);
    expect(result.eventId).toBe(validCleanedEventPayload.event_id);
  });
});
