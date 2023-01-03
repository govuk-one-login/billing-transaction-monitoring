import {
  copyObject,
  checkIfS3ObjectExists,
  deleteObjectInS3,
  getS3ItemsList,
  S3Object,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";
import { checkGivenStringExistsInLogs } from "../helpers/cloudWatchHelper";
import { waitForTrue } from "../helpers/commonHelpers";

const testStartTime = new Date().getTime();
const prefix = resourcePrefix();
const testinvoice: S3Object = {
  bucket: "di-btm-dev-raw-invoice-pdf",
  key: "Invoice.pdf",
};

describe("\n Happy path S3 standardised-invoice-storage-function test\n", () => {
  test("standardised-invoice-storage-function should be executed without errors upon uploading the file to s3 raw invoice pdf bucket", async () => {
    const uniqueString = Math.random().toString(36).substring(2, 7);
    const rawInvoice: S3Object = {
      bucket: `${prefix}-raw-invoice-pdf`,
      key: `raw-Invoice-${uniqueString}-validFile.pdf`,
    };
    await copyObject(testinvoice, rawInvoice);
    const checkRawPdfFileExists = await checkIfS3ObjectExists(rawInvoice);
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const givenStringExistsInLogs = await checkGivenStringExistsInLogs(
      `${prefix}-standardised-invoice-storage-function`,
      "ERROR",
      testStartTime
    ); // checks for ERROR string in standardised invoice storage function cloudwatch logs

    expect(givenStringExistsInLogs).toBeFalsy();

    const deleteFileAfterTest = async (): Promise<boolean> => {
      const result = await getS3ItemsList(rawInvoice.bucket, "successful");
      if (
        result?.Contents?.filter((t) => t.Key?.includes(rawInvoice.key)) != null
      ) {
        await deleteObjectInS3({
          bucket: rawInvoice.bucket,
          key: "successful/" + rawInvoice.key,
        });
        console.log("deleted the file from s3");
        return true;
      }
      return false;
    };
    const fileDeleted = await waitForTrue(deleteFileAfterTest, 1000, 5000);
    expect(fileDeleted).toBeTruthy();
  });
});
