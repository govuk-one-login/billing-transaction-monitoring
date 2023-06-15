import {
  invalidEventPayloadComponentId,
  invalidEventPayloadTimeStamp,
  invalidEventPayloadTimestampFormatted,
  validEventPayload,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { invokeCleanLambdaAndVerifyEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

describe("\n Clean Function - Happy path tests\n", () => {
  test("should store cleaned events in the storage bucket", async () => {
    const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
      validEventPayload
    );
    expect(result.success).toBe(true);
    expect(result.eventId).toBe(validEventPayload.event_id);
  });
});

describe("\n Clean Function - Unhappy path tests\n", () => {
  test("should not store event with invalid ComponentId in the storage bucket", async () => {
    const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
      invalidEventPayloadComponentId
    );
    expect(result.success).toBe(false);
  });

  test("should not store event with invalid Timestamp in the storage bucket", async () => {
    const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
      invalidEventPayloadTimeStamp
    );
    expect(result.success).toBe(false);
  });

  test("should not store event with invalid timestamp formatted in the storage bucket", async () => {
    const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
      invalidEventPayloadTimestampFormatted
    );
    expect(result.success).toBe(false);
  });
});
