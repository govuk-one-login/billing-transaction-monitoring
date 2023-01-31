import { wait } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { addFauxDataToTestPaths } from "../../src/handlers/int-test-support/helpers/mock-data/csv/addFauxDataToTestPaths";
import { objectsToCSV } from "../../src/handlers/int-test-support/helpers/mock-data/csv/objectsToCsv";
import { testPaths } from "../../src/handlers/int-test-support/helpers/mock-data/csv/transformCSV-to-event-test-data";
import {
  deleteS3Objects,
  getS3Object,
  putS3Object,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";

import { TransactionEventBodyObject } from "../../src/handlers/transaction-csv-to-json-event/process-row";

const prefix = resourcePrefix();

describe("\n Given a csv with event data is uploaded to the transaction csv bucket", () => {
  const folderPrefix = "btm_transactions";
  const bucketName = `${prefix}-storage`;

  beforeAll(async () => {
    // First delete all transactions in btm_transaction
    await deleteS3Objects({ bucketName, prefix: folderPrefix });
    // Add data to build the test csv
    const augmentedData = addFauxDataToTestPaths(testPaths, {
      Timestamp: "2023-01-01T00:27:41.186Z",
      "RP Entity Id": "fake rp entity id",
    });
    // Filter and rename data in the test csv
    const csvString = objectsToCSV(augmentedData, {
      filterKeys: ["path"],
      renameKeys: new Map([
        ["entity", "Idp Entity Id"],
        ["loa", "Minimum Level Of Assurance"],
        ["status", "Billable Status"],
        ["eventId", "Request Id"],
      ]),
    });
    // Upload the csv file to S3 transaction csv bucket
    const testObject: S3Object = {
      bucket: `${prefix}-transaction-csv`,
      key: `fakeBillingReport.csv`,
    };
    await putS3Object({ target: testObject, data: Buffer.from(csvString) });
    await wait(10000); // added implicit wait for the file to be uploaded
  });

  it("stores valid events in the storage/btm_transactions/yyyy-mm-dd folder", async () => {
    for (let i = 0; i < testPaths.length; i++) {
      const s3Object = await getS3Object({
        bucket: bucketName,
        key: `${folderPrefix}/${"2023-01-01"}/${
          testPaths[i].eventId as string
        }.json`,
      });

      if (testPaths[i].path === "happy" && s3Object !== undefined) {
        const s3Event: TransactionEventBodyObject = JSON.parse(s3Object);
        expect(s3Event.client_id).toEqual(testPaths[i].clientId);
        expect(s3Event.event_id).toEqual(testPaths[i].eventId);
        expect(s3Event.event_name).toEqual(testPaths[i].eventName);
      }
    }
  });

  it("does not store invalid events in the storage/btm-transactions/yyyy-mm-dd folder", async () => {
    for (let i = 0; i < testPaths.length; i++) {
      const s3Object = await getS3Object({
        bucket: bucketName,
        key: `${folderPrefix}/${"2023-01-01"}/${
          testPaths[i].eventId as string
        }.json`,
      });
      if (testPaths[i].path === "sad") {
        expect(s3Object).toEqual("NoSuchKey");
      }
    }
  });
});
