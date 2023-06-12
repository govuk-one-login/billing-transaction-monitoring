import {
  validEventPayload,
  invalidEventPayloadEventName,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { invokeFilterLambdaAndVerifyEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

describe("\n Filter function - Happy path tests\n", () => {
  test("should store event in the storage bucket for a valid event", async () => {
    const result = await invokeFilterLambdaAndVerifyEventInS3Bucket(
      validEventPayload
    );
    expect(result.success).toBe(true);
    expect(result.eventId).toBe(validEventPayload.event_id);
  });
});

describe("\n Filter Function - Unhappy path tests\n", () => {
  test("should not store events with invalid EventName in the storage bucket", async () => {
    const result = await invokeFilterLambdaAndVerifyEventInS3Bucket(
      invalidEventPayloadEventName
    );
    expect(result.success).toBe(false);
  });
});
