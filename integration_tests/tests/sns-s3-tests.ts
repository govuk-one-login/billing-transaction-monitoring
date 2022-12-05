import { publishSNS } from "../helpers/snsHelper";
import { PublishResponse } from "@aws-sdk/client-sns";
import { getS3ItemsList } from "../helpers/s3Helper";
import { waitForTrue } from "../helpers/commonHelpers";
import {
  snsValidEventPayload,
  snsInvalidEventNamePayload,
  snsEventMissingCompIdPayload,
  snsEventInvalidCompId,
  snsInvalidTimeStampPayload,
  snsEventMissingTimestampPayload,
  snsEventWithAdditionalFieldsPayload,
  snsMissingEventNamePayload,
  snsMissingEventIdPayload,
  snsEventMisisingEventIdValue,
} from "../payloads/snsEventPayload";
import { resourcePrefix } from "../helpers/envHelper";

let snsResponse: PublishResponse;
const storageBucket: string = `${resourcePrefix()}-storage`;
const objectsPrefix = "btm_transactions";

console.log(storageBucket);

describe(
  "\n Happy path tests\n" +
    "\n Publish valid SNS message and expect eventid stored in S3\n",
  () => {
    test("S3 should contain event id for valid SNS message", async () => {
      snsResponse = await publishSNS(snsValidEventPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const checkEventId = async () => {
        const result = await getS3ItemsList(storageBucket, objectsPrefix);
        if (result.Contents !== undefined) {
          console.log("Storage bucket contents not empty");
          return JSON.stringify(
            result.Contents?.map((data) => data.Key)
          ).includes(snsValidEventPayload.event_id);
        } else {
          console.log("Storage bucket contents empty");
          return false;
        }
      };
      const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
      expect(eventIdExists).toBeTruthy();
    });

    test("S3 should contain event id for SNS message with additional fields in the payload", async () => {
      snsResponse = await publishSNS(snsEventWithAdditionalFieldsPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const checkEventId = async () => {
        const result = await getS3ItemsList(storageBucket, objectsPrefix);
        if (result.Contents !== undefined) {
          console.log("Storage bucket contents not empty");
          return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
            snsEventWithAdditionalFieldsPayload.event_id
          );
        } else {
          console.log("Storage bucket contents empty");
          return false;
        }
      };

      const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
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
      const checkEventId = async () => {
        const result = await getS3ItemsList(storageBucket, objectsPrefix);

        if (result.Contents !== undefined) {
          console.log("Storage bucket contents not empty");
          return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
            snsInvalidEventNamePayload.event_id
          );
        } else {
          console.log("Storage bucket contents empty");
          return false;
        }
      };
      const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with invalid ComponentId in the payload", async () => {
      snsResponse = await publishSNS(snsEventInvalidCompId);
      expect(snsResponse).toHaveProperty("MessageId");
      const checkEventId = async () => {
        const result = await getS3ItemsList(storageBucket, objectsPrefix);
        if (result.Contents !== undefined) {
          console.log("Storage bucket contents not empty");

          return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
            snsEventInvalidCompId.event_id
          );
        } else {
          console.log("Storage bucket contents empty");
          return false;
        }
      };
      const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with invalid Timestamp in the payload", async () => {
      snsResponse = await publishSNS(snsInvalidTimeStampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const checkEventId = async () => {
        const result = await getS3ItemsList(storageBucket, objectsPrefix);
        if (result.Contents !== undefined) {
          console.log("Storage bucket contents not empty");
          return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
            snsInvalidTimeStampPayload.event_id
          );
        } else {
          console.log("Storage bucket contents empty");
          return false;
        }
      };
      const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should no contain eventid for SNS message with missing timestamp field in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingTimestampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const checkEventId = async () => {
        const result = await getS3ItemsList(storageBucket, objectsPrefix);
        if (result.Contents !== undefined) {
          console.log("Storage bucket contents not empty");
          return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
            snsEventMissingTimestampPayload.event_id
          );
        } else {
          console.log("Storage bucket contents empty");
          return false;
        }
      };
      const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with missing ComponentId field in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingCompIdPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const checkEventId = async () => {
        const result = await getS3ItemsList(storageBucket, objectsPrefix);
        if (result.Contents !== undefined) {
          console.log("Storage bucket contents not empty");

          return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
            snsEventMissingCompIdPayload.event_id
          );
        } else {
          console.log("Storage bucket contents empty");
          return false;
        }
      };
      const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with missing EventName field in the payload", async () => {
      snsResponse = await publishSNS(snsMissingEventNamePayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const checkEventId = async () => {
        const result = await getS3ItemsList(storageBucket, objectsPrefix);
        if (result.Contents !== undefined) {
          console.log("Storage bucket contents not empty");
          return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
            snsMissingEventNamePayload.event_id
          );
        } else {
          console.log("Storage bucket contents empty");
          return false;
        }
      };
      const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with missing EventId value in the payload", async () => {
      snsResponse = await publishSNS(snsEventMisisingEventIdValue);
      expect(snsResponse).toHaveProperty("MessageId");
      const checkEventId = async () => {
        const result = await getS3ItemsList(storageBucket, objectsPrefix);
        if (result.Contents !== undefined) {
          console.log("Storage bucket contents not empty");

          return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
            "event_id=null"
          );
        } else {
          console.log("Storage bucket contents empty");
          return false;
        }
      };
      const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
      expect(eventIdExists).toBeFalsy();
    });

    test("S3 should not contain eventid for SNS message with missing EventId field in the payload", async () => {
      snsResponse = await publishSNS(snsMissingEventIdPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const checkEventId = async () => {
        const result = await getS3ItemsList(storageBucket, objectsPrefix);
        if (result.Contents !== undefined) {
          console.log("Storage bucket contents not empty")
        return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
          "event_id=undefined"
        );
      } else {
        console.log("Storage bucket contents empty");
        return false;
      }
    }
      const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
      expect(eventIdExists).toBeFalsy();
    });
  });
