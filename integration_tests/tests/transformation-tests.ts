import path from "path";
import fs from "fs";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  S3Object,
  putS3Object,
  listS3Objects,
  deleteS3FolderBasedOnDate,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { wait } from "../../src/handlers/int-test-support/helpers/commonHelpers";

const prefix = resourcePrefix();
const storageBucket = `${resourcePrefix()}-storage`;
const folderPrefix = "btm_transactions";

describe("\n Upload verify fake csv to transformation bucket tests and check valid events from csv match with s3 events", () => {
  beforeAll(async () => {
    // before the test runs deletes the btm_transaction/datePrefix folder created by previous run
    await deleteS3FolderBasedOnDate(storageBucket, folderPrefix);
    console.log("Existing sub folders within btm_transactions are deleted");
    const fakeCsvFile = "../payloads/fakeBillingReport.csv";
    const filePath = path.join(__dirname, fakeCsvFile);
    const csvFileData = fs.readFileSync(filePath);
    const testObject: S3Object = {
      bucket: `${prefix}-transformation`,
      key: `fakeBillingReport.csv`,
    };

    await putS3Object({ target: testObject, data: csvFileData });
    await wait(10000);
  });

  test("events which are satisfied client and event name matching rule from csv should be stored in s3 storage bucket", async () => {
    const { Contents } = await listS3Objects({
      bucketName: storageBucket,
      prefix: folderPrefix,
    });
    console.log(Contents);
    if (Contents === undefined) throw new Error("Contents Empty");
    // TODO
  });

  test("events which are not satisfied client and event name matching rule from csv should not be stored in s3 storage bucket", async () => {
    // TODO
  });
});
