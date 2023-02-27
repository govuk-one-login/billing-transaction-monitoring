import { PublishResponse } from "@aws-sdk/client-sns";
import {
  snsInvalidEventPayloadComponentId,
  snsInvalidEventPayloadEventId,
  snsInvalidEventPayloadEventName,
  snsInvalidEventPayloadTimeStamp,
  snsInvalidEventPayloadTimestampFormatted,
  snsValidEventPayload,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { listS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { publishToTestTopic } from "../../src/handlers/int-test-support/helpers/snsHelper";

let snsResponse: PublishResponse;
const storageBucket: string = `${resourcePrefix()}-storage`;
const objectsPrefix = "btm_transactions";

const checkS3BucketForEventId = async (
  eventIdString: string,
  timeoutMs: number
): Promise<boolean> => {
  const pollS3BucketForEventIdString = async (): Promise<boolean> => {
    const result = await listS3Objects({
      bucketName: storageBucket,
      prefix: objectsPrefix,
    });
    if (result.Contents !== undefined) {
      return JSON.stringify(result.Contents.map((x) => x.Key)).includes(
        eventIdString
      );
    } else {
      return false;
    }
  };

  return await poll(pollS3BucketForEventIdString, (result: boolean) => result, {
    timeout: timeoutMs,
  });
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
  }
);

describe(
  "\nUnhappy path tests\n" +
    "\n Publish invalid SNS message and expect event id not stored in S3\n",
  () => {
    test("S3 should not contain event id for SNS message with invalid EventName in the payload", async () => {
      snsResponse = await publishToTestTopic(snsInvalidEventPayloadEventName);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsInvalidEventPayloadEventName.event_id,
        3000
      );
      console.log(eventIdExists);
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain event id for SNS message with invalid ComponentId in the payload", async () => {
      snsResponse = await publishToTestTopic(snsInvalidEventPayloadComponentId);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsInvalidEventPayloadComponentId.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain event id for SNS message with invalid Timestamp in the payload", async () => {
      snsResponse = await publishToTestTopic(snsInvalidEventPayloadTimeStamp);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsInvalidEventPayloadTimeStamp.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain event id for SNS message with invalid event id in the payload", async () => {
      snsResponse = await publishToTestTopic(snsInvalidEventPayloadEventId);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsInvalidEventPayloadEventId.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain event id for SNS message with invalid timestamp formatted in the payload", async () => {
      snsResponse = await publishToTestTopic(
        snsInvalidEventPayloadTimestampFormatted
      );
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkS3BucketForEventId(
        snsInvalidEventPayloadTimestampFormatted.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });
  }
);
