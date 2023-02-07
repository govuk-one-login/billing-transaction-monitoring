import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { mockIdpCsvData } from "../../src/handlers/int-test-support/helpers/mock-data/csv";
import {
  deleteS3Objects,
  getS3Object,
  listS3Objects,
  putS3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";

const transactionsDirectory = "btm_transactions";
const outputBucket = `${resourcePrefix()}-storage`;
const inputBucket = `${resourcePrefix()}-transaction-csv`;

const { csv, happyPathCount, testCases } = mockIdpCsvData();

describe("Given a csv with event data is uploaded to the transaction csv bucket", () => {
  beforeAll(async () => {
    // First delete all transactions in btm_transaction
    await deleteS3Objects({
      bucketName: outputBucket,
      prefix: transactionsDirectory,
    });
    // Add data to build the test csv

    // Upload the csv file to S3 transaction csv bucket
    await putS3Object({
      target: {
        bucket: inputBucket,
        key: `fakeBillingReport.csv`,
      },
      data: csv,
    });
    await poll(
      async () =>
        await listS3Objects({
          bucketName: outputBucket,
          prefix: transactionsDirectory,
        }),
      (result) =>
        result.Contents?.length !== undefined &&
        result.Contents?.length === happyPathCount
    );
  });

  it("stores the events we care about in the storage bucket", async () => {
    for (const testCase of testCases) {
      const s3Object = await getS3Object({
        bucket: outputBucket,
        key: `${transactionsDirectory}/${"2023-01-01"}/${
          testCase.expectedEventId
        }.json`,
      });
      switch (testCase.expectedPath) {
        case "happy": {
          if (s3Object === undefined || s3Object === "NoSuchKey")
            throw new Error("No event was made for a happy path");
          const s3Event = JSON.parse(s3Object);
          expect(s3Event.client_id).toEqual(testCase.expectedClientId);
          expect(s3Event.event_id).toEqual(testCase.expectedEventId);
          expect(s3Event.event_name).toEqual(testCase.expectedEventName);
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
