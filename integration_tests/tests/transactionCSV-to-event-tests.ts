import { wait } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { addFauxDataToTestPaths } from "../../src/handlers/int-test-support/helpers/mock-data/csv/addFauxDataToTestPaths";
import { objectsToCSV } from "../../src/handlers/int-test-support/helpers/mock-data/csv/objectsToCsv";
import {
  deleteS3Objects,
  getS3Object,
  putS3Object,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { testPaths } from "../payloads/transactionCSV-to-event-test-data";

const prefix = resourcePrefix();

describe("\n Given a csv with event data is uploaded to the transformation bucket", () => {
  const folderPrefix = "btm_transactions";
  const bucketName = `${prefix}-storage`;

  // 1. Ensure S3 bucket storage/btm_transactions is empty
  beforeAll(async () => {
    await deleteS3Objects({ bucketName, prefix: folderPrefix });

    // 2. Add const testPaths (see lines 12-229)

    // 3. Augment the data (see line 231)
    const augmentedData = addFauxDataToTestPaths(testPaths, {
      Timestamp: "2023-01-01T00:27:41.186Z",
      "RP Entity Id": "fake rp entity id",
    });
    console.log(augmentedData);

    // 4. Convert to a csv string (see line 237)
    const csvString = objectsToCSV(augmentedData, {
      filterKeys: ["path"],
      renameKeys: new Map([
        ["entity", "Idp Entity Id"],
        ["loa", "Minimum Level Of Assurance"],
        ["status", "Billable Status"],
        ["eventId", "Request Id"],
      ]),
    });
    // 5. Upload the csv file to S3 transformation bucket
    const testObject: S3Object = {
      bucket: `${prefix}-transaction-csv`,
      key: `fakeBillingReport.csv`,
    };
    await putS3Object({ target: testObject, data: Buffer.from(csvString) });
    await wait(10000);
  });

  it("stores valid events in the storage/btm_transactions/yyyy-mm-dd folder", async () => {
    for (let i = 0; i < testPaths.length; i++) {
      const s3Object = await getS3Object({
        bucket: bucketName,
        key: `btm_transactions/${"2023-01-01"}/${testPaths[i].eventId}.json`,
      });
      if (testPaths[i].path === "happy") {
        expect(s3Object).toContain(testPaths[i].clientId);
        expect(s3Object).toContain(testPaths[i].eventId);
        expect(s3Object).toContain(testPaths[i].eventName);
      }
    }
  });

  it("does not store invalid events in the storage/btm-transactions/yyyy-mm-dd folder", async () => {
    for (let i = 0; i < testPaths.length; i++) {
      const s3Object = await getS3Object({
        bucket: bucketName,
        key: `btm_transactions/${"2023-01-01"}/${testPaths[i].eventId}.json`,
      });
      if (testPaths[i].path === "sad") {
        expect(s3Object).toEqual("NoSuchKey");
      }
    }
  });
});
