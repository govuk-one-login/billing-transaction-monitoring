import {
  deleteObjectInS3,
  copyObject,
  checkIfFileExists,
} from "../helpers/s3Helper";
import { checkGivenStringExistsInLogs } from "../helpers/cloudWatchHelper";
import { resourcePrefix } from "../helpers/envHelper";

const testStartTime = new Date().getTime();
const prefix = resourcePrefix();

describe("\n Upload file to s3 bucket and validate extract lambda executed successfully \n", () => {
  const bucketName = `${prefix}-raw-invoice-pdf`;
  const key = "IP_Invoice.pdf";

  afterAll(async () => {
    await deleteObjectInS3(bucketName, key);
    console.log("deleted the file from s3");
  });

  test("extract lambda function should be executed and contains JobId upon uploading the file to s3 raw invoice pdf bucket", async () => {
    await copyObject(
      `${prefix}-raw-invoice-pdf`,
      `${prefix}-test-invoice-pdf/IP_Invoice.pdf`,
      key
    );
    const fileExistsInRawS3 = await checkIfFileExists(
      `${prefix}-raw-invoice-pdf`,
      key
    );
    expect(fileExistsInRawS3).toBeTruthy();

    const fileNameExistsInLogs = await checkGivenStringExistsInLogs(
      `${prefix}-extract-function`,
      key,
      testStartTime
    );
    expect(fileNameExistsInLogs).toBeTruthy();

    const jobIdExistsInLogs = await checkGivenStringExistsInLogs(
      `${prefix}-extract-function`,
      "Job ID",
      testStartTime
    );
    expect(jobIdExistsInLogs).toBeTruthy();
  });
});
