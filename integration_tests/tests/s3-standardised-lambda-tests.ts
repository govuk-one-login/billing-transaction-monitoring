import {
  copyObject,
  checkIfFileExists,
  deleteObjectInS3,
  getS3ItemsList,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";
import { checkGivenStringExistsInLogs } from "../helpers/cloudWatchHelper";
import { waitForTrue } from "../helpers/commonHelpers";
import {
  makeInvoicePDF,
  orchestrator,
  randomInvoice,
} from "../helpers/mock-data/invoice";
import { writeInvoiceToS3 } from "../helpers/mock-data/writer";

const prefix = resourcePrefix();


describe("\n Happy path S3 standardised-invoice-storage-function test\n", () => {
  test("standardised-invoice-storage-function should be executed without errors upon uploading the file to s3 raw invoice pdf bucket", async () => {
    const testStartTime = new Date();
    const invoice = randomInvoice();
    const { bucketName, path } = await makeInvoicePDF(writeInvoiceToS3)(
      invoice
    );

    const checkRawPdfFileExists = await checkIfFileExists(bucketName, path);
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const givenStringExistsInLogs = await checkGivenStringExistsInLogs(
      `${prefix}-standardised-invoice-storage-function`,
      "ERROR",
      testStartTime.getTime()
    ); // checks for ERROR string in standardised invoice storage function cloudwatch logs

    expect(givenStringExistsInLogs).toBeFalsy();

    const deleteFileAfterTest = async () => {
      const result = await getS3ItemsList(bucketName, "successful");
      if (
        (result.Contents?.filter((t) => t.Key?.includes(path))) != null
      ) {
        await deleteObjectInS3(
          bucketName,
          "successful/" + path
        );
        console.log("deleted the file from s3");
        return true;
      }
    };
    const fileDeleted = await waitForTrue(deleteFileAfterTest, 1000, 5000);
    expect(fileDeleted).toBeTruthy();
  });
});
