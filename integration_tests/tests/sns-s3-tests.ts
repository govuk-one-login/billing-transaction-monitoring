import {
  snsInvalidEventPayloadComponentId,
  snsInvalidEventPayloadEventId,
  snsInvalidEventPayloadEventName,
  snsInvalidEventPayloadTimeStamp,
  snsInvalidEventPayloadTimestampFormatted,
  snsValidEventPayload,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { generateAndCheckEventsInS3BucketViaFilterLambda } from "../../src/handlers/int-test-support/helpers/testDataHelper";

describe(
  "\n Happy path tests\n" +
    "\n Publish valid SNS message and expect event id stored in S3\n",
  () => {
    test("S3 should contain event id for valid SNS message", async () => {
      const result = await generateAndCheckEventsInS3BucketViaFilterLambda(
        snsValidEventPayload
      );
      expect(result.success).toBe(true);
      expect(result.eventId).toBe(snsValidEventPayload.event_id);
    });
  }
);

describe(
  "\nUnhappy path tests\n" +
    "\n Publish invalid SNS message and expect event id not stored in S3\n",
  () => {
    test("S3 should not contain event id for SNS message with invalid EventName in the payload", async () => {
      const result = await generateAndCheckEventsInS3BucketViaFilterLambda(
        snsInvalidEventPayloadEventName
      );
      expect(result.success).toBe(false);
    });

    test("S3 should not contain event id for SNS message with invalid ComponentId in the payload", async () => {
      const result = await generateAndCheckEventsInS3BucketViaFilterLambda(
        snsInvalidEventPayloadComponentId
      );
      expect(result.success).toBe(false);
    });

    test("S3 should not contain event id for SNS message with invalid Timestamp in the payload", async () => {
      const result = await generateAndCheckEventsInS3BucketViaFilterLambda(
        snsInvalidEventPayloadTimeStamp
      );
      expect(result.success).toBe(false);
    });

    test("S3 should not contain event id for SNS message with invalid event id in the payload", async () => {
      const result = await generateAndCheckEventsInS3BucketViaFilterLambda(
        snsInvalidEventPayloadEventId
      );
      expect(result.success).toBe(false);
    });

    test("S3 should not contain event id for SNS message with invalid timestamp formatted in the payload", async () => {
      const result = await generateAndCheckEventsInS3BucketViaFilterLambda(
        snsInvalidEventPayloadTimestampFormatted
      );
      expect(result.success).toBe(false);
    });
  }
);
