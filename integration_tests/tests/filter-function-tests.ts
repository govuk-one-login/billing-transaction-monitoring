import {
  validEventPayload,
  invalidEventPayloadEventName,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { invokeFilterLambdaAndVerifyEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

describe(
  "\n Filter function - Happy path tests\n" +
    "\n Generate valid event and expect event id stored in S3\n",
  () => {
    test("S3 should contain event id for the generated valid event", async () => {
      const result = await invokeFilterLambdaAndVerifyEventInS3Bucket(
        validEventPayload
      );
      expect(result.success).toBe(true);
      expect(result.eventId).toBe(validEventPayload.event_id);
    });
  }
);

describe(
  "\n Filter Function - Unhappy path tests\n" +
    "\n Generate invalid event and expect event id not stored in S3\n",
  () => {
    test("S3 should not contain event id for event payload which has invalid EventName in the payload", async () => {
      const result = await invokeFilterLambdaAndVerifyEventInS3Bucket(
        invalidEventPayloadEventName
      );
      expect(result.success).toBe(false);
    });
  }
);
