import {
  deleteObjectInS3,
  copyObject,
  checkIfFileExists,
} from "../helpers/s3Helper";
import { checkGivenStringExistsInLogs } from "../helpers/cloudWatchHelper";
import { resourcePrefix } from "../helpers/envHelper";

const testStartTime = new Date().getTime();
const prefix = resourcePrefix();

describe("\n Upload file to raw s3 bucket and validate the filename in textract data lambda logs \n", () => {
  const bucketName = `${prefix}-raw-invoice-pdf`;
  const uniqueString = Math.random().toString(36).substring(2, 7);
  const destinationBucketKey = `raw-Invoice-${uniqueString}.pdf`;

  afterAll(async () => {
    await deleteObjectInS3(bucketName, destinationBucketKey);
    console.log("deleted the file from s3");
  });

  test("textractData lambda log should contain uploaded raw invoice filename", async () => {
    await copyObject(
      `${prefix}-raw-invoice-pdf`,
      `${prefix}-test-invoice-pdf/Invoice.pdf`,
      destinationBucketKey
    );
    const fileExistsInRawS3 = await checkIfFileExists(
      `${prefix}-raw-invoice-pdf`,
      destinationBucketKey
    );
    expect(fileExistsInRawS3).toBeTruthy();

    const fileNameExistsInTextractLambdaLogs =
      await checkGivenStringExistsInLogs(
        `${prefix}-raw-textract-storage-function`,
        destinationBucketKey,
        testStartTime
      );
    expect(fileNameExistsInTextractLambdaLogs).toBeTruthy();
  });

  test.todo("Upload file to raw s3 bucket and validate raw invoice textract data stored in s3", async () => {
    await copyObject(
      `${prefix}-raw-invoice-pdf`,
      `${prefix}-test-invoice-pdf/Invoice.pdf`,
      destinationBucketKey
    );
    const fileExistsInRawS3 = await checkIfFileExists(
      `${prefix}-raw-invoice-pdf`,
      destinationBucketKey
    );
    expect(fileExistsInRawS3).toBeTruthy();

    const fileExistsInRawTextractDataS3 = await checkIfFileExists(
      `${prefix}-raw-invoice-textract-data`,
      destinationBucketKey
    );
    expect(fileExistsInRawTextractDataS3).toBeTruthy();
  });
});
