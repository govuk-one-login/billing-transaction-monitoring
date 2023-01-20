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
} from "../payloads/snsEventPayload";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { listS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";
import { waitForTrue } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { publishSNS } from "../../src/handlers/int-test-support/helpers/snsHelper";

let snsResponse: PublishResponse;
const storageBucket: string = `${resourcePrefix()}-storage`;
const objectsPrefix = "btm_transactions";

console.log(storageBucket);

const checkForEventId = async (
  eventIdCheck: string,
  timeoutMs: number
): Promise<boolean> => {
  const checkEventId = async (): Promise<boolean> => {
    const result = await listS3Objects({
      bucketName: storageBucket,
      prefix: objectsPrefix,
    });
    if (result.Contents !== undefined) {
      return JSON.stringify(result.Contents.map((x) => x.Key)).includes(
        eventIdCheck
      );
    } else {
      console.log("Storage bucket contents empty");
      return false;
    }
  };
  return await waitForTrue(checkEventId, 1000, timeoutMs);
};

describe(
  "\n Happy path tests\n" +
    "\n Publish valid SNS message and expect eventid stored in S3\n",
  () => {
    test("S3 should contain event id for valid SNS message", async () => {
      snsResponse = await publishSNS(snsValidEventPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkForEventId(
        snsValidEventPayload.event_id,
        7000
      );
      expect(eventIdExists).toBeTruthy();
    });

    test("S3 should contain event id for SNS message with additional fields in the payload", async () => {
      snsResponse = await publishSNS(snsEventWithAdditionalFieldsPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkForEventId(
        snsEventWithAdditionalFieldsPayload.event_id,
        5000
      );
      expect(eventIdExists).toBeTruthy();
    });
  }
);

describe(
  "\nUnhappy path tests\n" +
    "\n Publish invalid SNS message and expect eventid not stored in S3\n",
  () => {
    test("S3 should not contain eventid for SNS message with invalid EventName in the payload", async () => {
      snsResponse = await publishSNS(snsInvalidEventNamePayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkForEventId(
        snsInvalidEventNamePayload.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with invalid ComponentId in the payload", async () => {
      snsResponse = await publishSNS(snsEventInvalidCompId);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkForEventId(
        snsEventInvalidCompId.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with invalid Timestamp in the payload", async () => {
      snsResponse = await publishSNS(snsInvalidTimeStampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkForEventId(
        snsInvalidTimeStampPayload.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should no contain eventid for SNS message with missing timestamp field in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingTimestampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkForEventId(
        snsEventMissingTimestampPayload.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with missing ComponentId field in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingCompIdPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkForEventId(
        snsEventMissingCompIdPayload.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with missing EventName field in the payload", async () => {
      snsResponse = await publishSNS(snsMissingEventNamePayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkForEventId(
        snsMissingEventNamePayload.event_id,
        3000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with missing EventId value in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingEventIdValue);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkForEventId("event_id=null", 5000);
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with missing EventId field in the payload", async () => {
      snsResponse = await publishSNS(snsMissingEventIdPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkForEventId("event_id=undefined", 5000);
      expect(eventIdExists).toBeFalsy();
    });
  }
);
