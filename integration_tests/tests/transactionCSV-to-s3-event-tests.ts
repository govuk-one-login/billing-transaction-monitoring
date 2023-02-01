import { waitForTrue } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { addFauxDataToTestCases } from "../../src/handlers/int-test-support/helpers/mock-data/csv/addFauxDataToTestCases";
import { objectsToCSV } from "../../src/handlers/int-test-support/helpers/mock-data/csv/objectsToCsv";
import { testCases } from "../../src/handlers/int-test-support/helpers/mock-data/csv/transformCSV-to-event-test-data";
import {
  deleteS3Objects,
  getS3Object,
  listS3Objects,
  putS3Object,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";

const prefix = resourcePrefix();
const folderPrefix = "btm_transactions";
const bucketName = `${prefix}-storage`;

const checkS3BucketForEventIds = async (): Promise<boolean> => {
  const result = await listS3Objects({
    bucketName,
    prefix: folderPrefix,
  });
  if (
    result.Contents === undefined ||
    result.Contents.length !==
      testCases.filter((data) => data.expectedPath === "happy").length
  ) {
    return false;
  } else {
    return true;
  }
};

describe("\n Given a csv with event data is uploaded to the transaction csv bucket", () => {
  beforeAll(async () => {
    // First delete all transactions in btm_transaction
    await deleteS3Objects({ bucketName, prefix: folderPrefix });
    // Add data to build the test csv
    const augmentedData = addFauxDataToTestCases(testCases, {
      Timestamp: "2023-01-01T00:27:41.186Z",
      "RP Entity Id": "fake rp entity id",
    });
    // Filter and rename data in the test csv
    const csvString = objectsToCSV(augmentedData, {
      filterKeys: ["expectedPath"],
      renameKeys: new Map([
        ["givenEntity", "Idp Entity Id"],
        ["givenLoa", "Minimum Level Of Assurance"],
        ["givenStatus", "Billable Status"],
        ["expectedEventId", "Request Id"],
      ]),
    });
    // Upload the csv file to S3 transaction csv bucket
    const testObject: S3Object = {
      bucket: `${prefix}-transaction-csv`,
      key: `fakeBillingReport.csv`,
    };
    await putS3Object({ target: testObject, data: Buffer.from(csvString) });
  });

  it("stores valid events in the storage/btm_transactions/yyyy-mm-dd folder", async () => {
    const checkEventsExistsInS3 = await waitForTrue(
      checkS3BucketForEventIds,
      1000,
      10000
    );
    expect(checkEventsExistsInS3).toBe(true);
    for (let i = 0; i < testCases.length; i++) {
      const s3Object = await getS3Object({
        bucket: bucketName,
        key: `${folderPrefix}/${"2023-01-01"}/${
          testCases[i].expectedEventId
        }.json`,
      });

      if (testCases[i].expectedPath === "happy" && s3Object !== undefined) {
        const s3Event = JSON.parse(s3Object);
        expect(s3Event.client_id).toEqual(testCases[i].expectedClientId);
        expect(s3Event.event_id).toEqual(testCases[i].expectedEventId);
        expect(s3Event.event_name).toEqual(testCases[i].expectedEventName);
      }
    }
  });

  it("does not store invalid events in the storage/btm-transactions/yyyy-mm-dd folder", async () => {
    for (let i = 0; i < testCases.length; i++) {
      const s3Object = await getS3Object({
        bucket: bucketName,
        key: `${folderPrefix}/${"2023-01-01"}/${
          testCases[i].expectedEventId
        }.json`,
      });
      if (testCases[i].expectedPath === "sad") {
        expect(s3Object).toEqual("NoSuchKey");
      }
    }
  });
});
