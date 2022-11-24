import {
  putObjectToS3,
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

  test("extract lambda function should be executed without errors and contains JobId upon uploading the file to s3 raw invoice pdf bucket", async () => {
    await copyObject(
      `${prefix}-raw-invoice-pdf`,
      `${prefix}-test-invoice-pdf/IP_Invoice.pdf`,
      "IP_Invoice.pdf"
    );
    const fileExists = await checkIfFileExists(
      `${prefix}-raw-invoice-pdf`,
      "IP_Invoice.pdf"
    );
    expect(fileExists).toBeTruthy();
    const givenStringExistsInLogs = await checkGivenStringExistsInLogs(
      `${prefix}-extract-function`,
      "Job ID",
      testStartTime
    );
    expect(givenStringExistsInLogs).toBeTruthy();
  });
});
