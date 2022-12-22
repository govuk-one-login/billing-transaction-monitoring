import {
  deleteObjectInS3,
  copyObject,
  checkIfFileExists,
  getS3ItemsList,
  getS3Object,
  putObjectToS3,
} from "../helpers/s3Helper";
import path from "path";
import fs from "fs";
import { resourcePrefix } from "../helpers/envHelper";
import { waitForTrue } from "../helpers/commonHelpers";
import {
  makeInvoicePDF,
  orchestrator,
  randomInvoice,
} from "../helpers/mock-data/invoice";
import { writeInvoiceToS3 } from "../helpers/mock-data/writer";

const testStartTime = new Date();
const prefix = resourcePrefix();
const rawinvoiceBucketName = `${prefix}-raw-invoice-pdf`;

describe("\n Happy path S3 raw-invoice-pdf and raw-invoice-textract-data bucket test\n", () => {
  // const uniqueString = Math.random().toString(36).substring(2, 7);
  // const rawinvoiceBucketKey = `raw-Invoice-${uniqueString}-validFile.pdf`;

  test("raw-invoice-textract-data bucket should contain textract data file for uploaded valid pdf file in raw-invoice-pdf bucket and should move the original raw invoice to successful folder in s3 raw-invoice-pdf bucket", async () => {
    const invoice = randomInvoice();
    const { bucketName, path } = await makeInvoicePDF(writeInvoiceToS3)(
      invoice
    );

    const checkRawPdfFileExists = await checkIfFileExists(bucketName, path);
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const checkTextractDataFileContainsStringFromOriginalPdf =
      async (): Promise<boolean> => {
        const result = await getS3ItemsList(
          `${prefix}-raw-invoice-textract-data`
        );
        if (result.Contents === undefined) {
          return false;
        }

        const startTime = testStartTime.toISOString();
        const formattedTestStartTime = new Date(startTime);
        console.log(formattedTestStartTime);

        const s3ContentsFilteredByTestStartTime = result.Contents?.filter(
          (item) =>
            item.LastModified !== undefined &&
            item.LastModified >= formattedTestStartTime
        );
        console.log("Filtered contents:", s3ContentsFilteredByTestStartTime);
        if (s3ContentsFilteredByTestStartTime.length === 0) {
          return false;
        }
        const key = String(s3ContentsFilteredByTestStartTime[0].Key);
        const fileContents = await getS3Object(
          `${prefix}-raw-invoice-textract-data`,
          key
        );
        return fileContents?.includes(invoice.invoiceNumber) ?? false;
      };

    const textractFilteredObject = await waitForTrue(
      checkTextractDataFileContainsStringFromOriginalPdf,
      1000,
      21000
    );
    expect(textractFilteredObject).toBeTruthy();

    const isFileMovedToSuccessfulFolder = async (): Promise<boolean> => {
      const result = await getS3ItemsList(bucketName, "successful");
      if (result.Contents === undefined) {
        return false;
      }
      return result.Contents.some((t) => t.Key?.includes(path));
    };
    const originalFileExistsInSuccessfulFolder = await waitForTrue(
      isFileMovedToSuccessfulFolder,
      1000,
      21000
    );
    expect(originalFileExistsInSuccessfulFolder).toBeTruthy();
    await deleteObjectInS3(bucketName, "successful/" + path);
    console.log("deleted the file from s3");
  });
});

describe("\n Unappy path S3 raw-invoice-pdf and raw-invoice-textract-data bucket test\n", () => {
  const uniqueString = Math.random().toString(36).substring(2, 7);
  const rawinvoiceBucketKey = `raw-Invoice-${uniqueString}-invalidFile.pdf`;

  test("raw-invoice-textract-data bucket should not contain textract data file for uploaded invalid pdf file in raw-invoice-pdf bucket and should move the original raw invoice to failed folder in s3 raw-invoice-pdf bucket ", async () => {
    const file = "../payloads/invalidFiletoTestTextractFailure.pdf";
    const filename = path.join(__dirname, file);
    const fileStream = fs.createReadStream(filename);

    await putObjectToS3(rawinvoiceBucketName, rawinvoiceBucketKey, fileStream);

    const checkRawPdfFileExists = await checkIfFileExists(
      rawinvoiceBucketName,
      rawinvoiceBucketKey
    );
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const isFileMovedToFailedFolder = async (): Promise<boolean> => {
      const result = await getS3ItemsList(rawinvoiceBucketName, "failed");
      if (result.Contents === undefined) {
        return false;
      }
      return result.Contents.some((items) =>
        items.Key?.includes(rawinvoiceBucketKey)
      );
    };
    const originalFileExistsInFailedFolder = await waitForTrue(
      isFileMovedToFailedFolder,
      1000,
      20000
    );
    expect(originalFileExistsInFailedFolder).toBeTruthy();
    await deleteObjectInS3(
      rawinvoiceBucketName,
      "failed/" + rawinvoiceBucketKey
    );
    console.log("deleted the file from s3");
  });
});

describe("TEMP::mock-maker", () => {
  it("TEMP::mocks", async () => {
    await orchestrator();
  });
});
