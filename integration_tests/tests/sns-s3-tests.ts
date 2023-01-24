import { PublishResponse } from "@aws-sdk/client-sns";
import {
  snsEventInvalidCompId,
  snsEventMissingCompIdPayload,
  snsEventMissingEventIdValue,
  snsEventMissingTimestampPayload,
  snsEventWithAdditionalFieldsPayload,
  snsInvalidEventNamePayload,
  snsInvalidTimeStampPayload,
  snsMissingEventIdPayload,
  snsMissingEventNamePayload,
  snsValidEventPayload,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { listS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";
import { waitForTrue } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { publishToTestTopic } from "../../src/handlers/int-test-support/helpers/snsHelper";

let snsResponse: PublishResponse;
const storageBucket: string = `${resourcePrefix()}-storage`;
const objectsPrefix = "btm_transactions";

console.log(storageBucket);

const checkS3BucketForEventId = async (
  eventIdString: string,
  timeoutMs: number
): Promise<boolean> => {
  const checkS3BucketForEventIdString = async (): Promise<boolean> => {
    const result = await listS3Objects({
      bucketName: storageBucket,
      prefix: objectsPrefix,
    });
    if (result.Contents !== undefined) {
      return JSON.stringify(result.Contents.map((x) => x.Key)).includes(
        eventIdString
      );
    } else {
      console.log("Storage bucket contents empty");
      return false;
    }
  };
  return await waitForTrue(checkS3BucketForEventIdString, 1000, timeoutMs);
};

describe(
  "\n Happy path tests\n" +
    "\n Publish valid SNS message and expect event id stored in S3\n",
  () => {
    test("S3 should contain event id for valid SNS message", async () => {
      snsResponse = await publishToTestTopic(snsValidEventPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsValidEventPayload.event_id,
        7000
      );
      expect(eventIdExists).toBeTruthy();
    });

    test("S3 should contain event id for SNS message with additional fields in the payload", async () => {
      snsResponse = await publishToTestTopic(
        snsEventWithAdditionalFieldsPayload
      );
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsEventWithAdditionalFieldsPayload.event_id,
        5000
      );
      expect(eventIdExists).toBeTruthy();
    });
  }
);

describe(
  "\nUnhappy path tests\n" +
    "\n Publish invalid SNS message and expect event id not stored in S3\n",
  () => {
    test("S3 should not contain event id for SNS message with invalid EventName in the payload", async () => {
      snsResponse = await publishToTestTopic(snsInvalidEventNamePayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsInvalidEventNamePayload.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain event id for SNS message with invalid ComponentId in the payload", async () => {
      snsResponse = await publishToTestTopic(snsEventInvalidCompId);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsEventInvalidCompId.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain event id for SNS message with invalid Timestamp in the payload", async () => {
      snsResponse = await publishToTestTopic(snsInvalidTimeStampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsInvalidTimeStampPayload.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should no contain event id for SNS message with missing timestamp field in the payload", async () => {
      snsResponse = await publishToTestTopic(snsEventMissingTimestampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsEventMissingTimestampPayload.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain event id for SNS message with missing ComponentId field in the payload", async () => {
      snsResponse = await publishToTestTopic(snsEventMissingCompIdPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsEventMissingCompIdPayload.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain event id for SNS message with missing EventName field in the payload", async () => {
      snsResponse = await publishToTestTopic(snsMissingEventNamePayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsMissingEventNamePayload.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain event id for SNS message with missing EventId value in the payload", async () => {
      snsResponse = await publishToTestTopic(snsEventMissingEventIdValue);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        "event_id=null",
        5000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain event id for SNS message with missing EventId field in the payload", async () => {
      snsResponse = await publishToTestTopic(snsMissingEventIdPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        "event_id=undefined",
        5000
      );
      expect(eventIdExists).toBeFalsy();
    });
  }
);
