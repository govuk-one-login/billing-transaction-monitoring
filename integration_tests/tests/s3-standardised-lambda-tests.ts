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
const rawInvoiceBucketName = `${prefix}-raw-invoice-pdf`;

describe("\n Happy path S3 standardised-invoice-storage-function test\n", () => {
  test("standardised-invoice-storage-function should be executed without errors upon uploading the file to s3 raw invoice pdf bucket", async () => {
    const uniqueString = Math.random().toString(36).substring(2, 7);
    const rawInvoiceBucketKey = `raw-Invoice-${uniqueString}-validFile.pdf`;
    await copyObject(
      rawInvoiceBucketName,
      `${prefix}-test-invoice-pdf/Invoice.pdf`,
      rawInvoiceBucketKey
    );
    const checkRawPdfFileExists = await checkIfFileExists(
      rawInvoiceBucketName,
      rawInvoiceBucketKey
    );
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const givenStringExistsInLogs = await checkGivenStringExistsInLogs(
      `${prefix}-standardised-invoice-storage-function`,
      "ERROR",
      testStartTime
    ); // checks for ERROR string in standardised invoice storage function cloudwatch logs

    expect(givenStringExistsInLogs).toBeFalsy();

    const deleteFileAfterTest = async () => {
      const result = await getS3ItemsList(rawInvoiceBucketName, "successful");
      if (
        result.Contents?.filter((t) => t.Key?.includes(rawInvoiceBucketKey))
      ) {
        await deleteObjectInS3(
          rawInvoiceBucketName,
          "successful/" + rawInvoiceBucketKey
        );
        console.log("deleted the file from s3");
        return true;
      }
    };
    const fileDeleted = await waitForTrue(deleteFileAfterTest, 1000, 5000);
    expect(fileDeleted).toBeTruthy();
  });
});
