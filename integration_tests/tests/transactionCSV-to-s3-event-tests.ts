import {
  deleteS3Event,
  poll,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { mockCsvData } from "../../src/handlers/int-test-support/helpers/mock-data/csv";
import {
  getS3Object,
  listS3Objects,
  putS3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import {
  TRANSACTION_CSV_BUCKET,
  STORAGE_BUCKET,
  S3_TRANSACTION_FOLDER,
} from "../../src/handlers/int-test-support/test-constants";

const { csv, happyPathCount, testCases } = mockCsvData();

describe("Given a csv with event data is uploaded to the transaction csv bucket", () => {
  beforeAll(async () => {
    // Upload the csv file to S3 transaction csv bucket

    await putS3Object({
      target: {
        bucket: TRANSACTION_CSV_BUCKET,
        key: `fakeBillingReport.csv`,
      },
      data: csv,
    });
    await poll(
      async () =>
        await listS3Objects({
          bucketName: STORAGE_BUCKET,
          prefix: `${S3_TRANSACTION_FOLDER}/2023/01/01/`,
        }),
      (result) => {
        return result.length === happyPathCount;
      },
      {
        notCompleteErrorMessage:
          "Events CSV was not successfully uploaded within the given timeout",
      }
    );
  });

  it("stores the events we care about in the storage bucket", async () => {
    for (const testCase of testCases) {
      const s3Object = await getS3Object({
        bucket: STORAGE_BUCKET,
        key: `${S3_TRANSACTION_FOLDER}/2023/01/01/${testCase.expectedEventId}.json`,
      });
      switch (testCase.expectedPath) {
        case "happy": {
          if (s3Object === undefined || s3Object === "NoSuchKey")
            throw new Error("No event was made for a happy path");
          const s3Event = JSON.parse(s3Object);
          expect(s3Event.vendor_id).toEqual(testCase.expectedVendorId);
          expect(s3Event.event_id).toEqual(testCase.expectedEventId);
          expect(s3Event.event_name).toEqual(testCase.expectedEventName);
          await deleteS3Event(s3Event.event_id, s3Event.timestamp_formatted);
          break;
        }
        case "sad": {
          expect(s3Object).toEqual("NoSuchKey");
          break;
        }
      }
    }
  });
});
