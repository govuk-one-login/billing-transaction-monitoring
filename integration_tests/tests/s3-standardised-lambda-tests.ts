import {
  copyObject,
  checkIfFileExists,
  deleteObjectInS3,
  getS3ItemsList,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";
import { checkGivenStringExistsInLogs } from "../helpers/cloudWatchHelper";
import { waitForTrue } from "../helpers/commonHelpers";

const testStartTime = new Date().getTime();
const prefix = resourcePrefix();
const rawinvoiceBucketName = `${prefix}-raw-invoice-pdf`;

describe("\n Happy path S3 standardised-invoice-storage-function test\n", () => {
  test.only("standardised-invoice-storage-function should be executed without errors upon uploading the file to s3 raw invoice pdf bucket", async () => {
    const uniqueString = Math.random().toString(36).substring(2, 7);
    const rawinvoiceBucketKey = `raw-Invoice-${uniqueString}-validFile.pdf`;
    await copyObject(
      rawinvoiceBucketName,
      `${prefix}-test-invoice-pdf/Invoice.pdf`,
      rawinvoiceBucketKey
    );
    const checkRawPdfFileExists = await checkIfFileExists(
      rawinvoiceBucketName,
      rawinvoiceBucketKey
    );
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const givenStringExistsInLogs = await checkGivenStringExistsInLogs(
      `${prefix}-standardised-invoice-storage-function`,
      "ERROR",
      testStartTime
    ); // checks for ERROR string in standardised invoice storage function cludwatch logs

    expect(givenStringExistsInLogs).toBeFalsy();

    const isFileMovedToSuccessfulFolder = async () => {
      const result = await getS3ItemsList(rawinvoiceBucketName, "successful");
      return result.Contents?.filter((t) =>
        t.Key?.includes(rawinvoiceBucketKey)
      );
    };

    const originalFileExistsInSuccessfulFolder = await waitForTrue(
      isFileMovedToSuccessfulFolder,
      1000,
      20000
    );
    expect(originalFileExistsInSuccessfulFolder).toBeTruthy();
    await deleteObjectInS3(
      rawinvoiceBucketName,
      "successful/" + rawinvoiceBucketKey
    );
    console.log("deleted the file from s3");
  });
});
