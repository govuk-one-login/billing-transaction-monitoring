import {
  validEventPayload,
  invalidEventPayloadEventName,
  invalidEventPayloadComponentId,
  invalidEventPayloadTimeStamp,
  invalidEventPayloadTimestampFormatted,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { generateEventViaFilterLambdaAndCheckEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

describe(
  "\n Happy path tests\n" +
    "\n Generate valid event and expect event id stored in S3\n",
  () => {
    test("S3 should contain event id for the generated valid event", async () => {
      const result = await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
        validEventPayload
      );
      expect(result.success).toBe(true);
      expect(result.eventId).toBe(validEventPayload.event_id);
    });
  }
);

describe(
  "\nUnhappy path tests\n" +
    "\n Generate invalid event and expect event id not stored in S3\n",
  () => {
    test("S3 should not contain event id for event payload which has invalid EventName in the payload", async () => {
      const result = await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
        invalidEventPayloadEventName
      );
      expect(result.success).toBe(false);
    });

    test("S3 should not contain event id for event payload which has invalid ComponentId in the payload", async () => {
      const result = await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
        invalidEventPayloadComponentId
      );
      expect(result.success).toBe(false);
    });

    test("S3 should not contain event id for event payload which has invalid Timestamp in the payload", async () => {
      const result = await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
        invalidEventPayloadTimeStamp
      );
      expect(result.success).toBe(false);
    });

    test("S3 should not contain event id for event payload which has invalid timestamp formatted in the payload", async () => {
      const result = await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
        invalidEventPayloadTimestampFormatted
      );
      expect(result.success).toBe(false);
    });
  }
);
