import {
  invalidEventPayloadComponentId,
  invalidEventPayloadTimeStamp,
  invalidEventPayloadTimestampFormatted,
  validEventPayload,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { invokeCleanLambdaAndVerifyEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

describe("\n Clean Function - Happy path tests\n", () => {
  test("should store cleaned version of events in the storage bucket", async () => {
    const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
      validEventPayload
    );
    expect(result.success).toBe(true);
    expect(result.eventId).toBe(validEventPayload.event_id);
  });
});

describe(
  "\n Clean Function - Unhappy path tests\n" +
    "\n Generate invalid event and expect event id not stored in S3\n",
  () => {
    test("should not store event in the storage bucket which has invalid ComponentId in the payload", async () => {
      const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
        invalidEventPayloadComponentId
      );
      expect(result.success).toBe(false);
    });

    test("should not store event in the storage bucket which has invalid Timestamp in the payload", async () => {
      const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
        invalidEventPayloadTimeStamp
      );
      expect(result.success).toBe(false);
    });

    test("should not store event in the storage bucket which has invalid timestamp formatted in the payload", async () => {
      const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
        invalidEventPayloadTimestampFormatted
      );
      expect(result.success).toBe(false);
    });
  }
);
