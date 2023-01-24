import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { randomInvoiceData } from "../../src/handlers/int-test-support/helpers/mock-data/invoice";
import { createInvoiceInS3 } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import {
  checkIfS3ObjectExists,
  deleteS3Object,
  listS3Objects,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { checkGivenStringExistsInLogs } from "../../src/handlers/int-test-support/helpers/cloudWatchHelper";
import { waitForTrue } from "../../src/handlers/int-test-support/helpers/commonHelpers";

const prefix = resourcePrefix();

describe("\n Happy path S3 standardised-invoice-storage-function test\n", () => {
  test("standardised-invoice-storage-function should be executed without errors upon uploading the file to s3 raw invoice pdf bucket", async () => {
    const testStartTime = new Date();
    const invoiceData = randomInvoiceData();
    const s3Object = await createInvoiceInS3(invoiceData);

    const checkRawPdfFileExists = await checkIfS3ObjectExists(s3Object);
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const checkGivenStringExists = async (): Promise<boolean | undefined> => {
      return await checkGivenStringExistsInLogs({
        logName: `${prefix}-standardised-invoice-storage-function`,
        expectedString: "ERROR",
        testStartTime: testStartTime.getTime(),
      }); // checks for ERROR string in standardised invoice storage function cloudwatch logs
    };
    const expectedStringExists = await waitForTrue(
      checkGivenStringExists,
      3000,
      25000
    );

    expect(expectedStringExists).toBeFalsy();

    const deleteFileAfterTest = async (): Promise<boolean> => {
      const result = await listS3Objects({
        bucketName: s3Object.bucket,
        prefix: "successful",
      });
      const pathIsNotInBucket = !(
        result.Contents?.some((t) => t.Key?.includes(s3Object.key)) ?? false
      );
      if (pathIsNotInBucket) return false;

      await deleteS3Object({
        bucket: s3Object.bucket,
        key: "successful/" + s3Object.key,
      });
      console.log("deleted the file from s3");
      return true;
    };
    const fileDeleted = await waitForTrue(deleteFileAfterTest, 1000, 5000);
    expect(fileDeleted).toBeTruthy();
  });
});
