import {
  checkIfS3ObjectExists,
  deleteObjectInS3,
  getS3ItemsList,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";
import { checkGivenStringExistsInLogs } from "../helpers/cloudWatchHelper";
import { waitForTrue } from "../helpers/commonHelpers";
import {
  makeMockInvoicePDF,
  randomInvoice,
  writeInvoiceToS3,
} from "../helpers/mock-data/invoice";

const prefix = resourcePrefix();

describe("\n Happy path S3 standardised-invoice-storage-function test\n", () => {
  test("standardised-invoice-storage-function should be executed without errors upon uploading the file to s3 raw invoice pdf bucket", async () => {
    const testStartTime = new Date();
    const invoice = randomInvoice();
    const { bucketName, path } = await makeMockInvoicePDF(writeInvoiceToS3)(
      invoice
    );

    const checkRawPdfFileExists = await checkIfS3ObjectExists({
      bucket: bucketName,
      key: path,
    });
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const givenStringExistsInLogs = await checkGivenStringExistsInLogs(
      `${prefix}-standardised-invoice-storage-function`,
      "ERROR",
      testStartTime.getTime()
    ); // checks for ERROR string in standardised invoice storage function cloudwatch logs

    expect(givenStringExistsInLogs).toBeFalsy();

    const deleteFileAfterTest = async (): Promise<boolean> => {
      const result = await getS3ItemsList(bucketName, "successful");
      const pathIsNotInBucket = !(
        result.Contents?.some((t) => t.Key?.includes(path)) ?? false
      );
      if (pathIsNotInBucket) return false;

      await deleteObjectInS3({ bucket: bucketName, key: "successful/" + path });
      console.log("deleted the file from s3");
      return true;
    };
    const fileDeleted = await waitForTrue(deleteFileAfterTest, 1000, 5000);
    expect(fileDeleted).toBeTruthy();
  });
});
