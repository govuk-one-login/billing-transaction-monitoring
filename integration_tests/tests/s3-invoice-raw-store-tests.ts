import path from "path";
import fs from "fs";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  checkIfS3ObjectExists,
  deleteS3Object,
  getS3Object,
  listS3Objects,
  putS3Object,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { waitForTrue } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { randomInvoice } from "../../src/handlers/int-test-support/helpers/mock-data/invoice";
import { createInvoiceInS3 } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";

const prefix = resourcePrefix();
const testStartTime = new Date();
const givenVendorIdFolder = "vendor123";

describe("\n Happy path - Upload valid mock invoice pdf to the raw invoice pdf bucket test\n", () => {
  const storageBucket = `${prefix}-storage`;
  const textractBucket = `${prefix}-raw-invoice-textract-data`;
  const standardisedFolderPrefix = "btm_billing_standardised";
  const invoice = randomInvoice();
  test("raw-invoice-textract-data and storage buckets should contain textracted and standardised data file for uploaded valid pdf file in raw-invoice-pdf bucket and should move the original raw invoice to successful folder in s3 raw-invoice-pdf bucket", async () => {
    const s3Object = await createInvoiceInS3(invoice);
    const checkRawPdfFileExists = await checkIfS3ObjectExists(s3Object);
    expect(checkRawPdfFileExists).toBeTruthy();

    const checkTextractDataFileContainsStringFromOriginalPdf =
      async (): Promise<boolean> => {
        const textractedFileContents =
          await getS3FileContentsBasedOnLastModified(
            testStartTime,
            textractBucket
          );
        return textractedFileContents.some((file) =>
          file?.includes(invoice.invoiceNumber)
        );
      };

    const textractFilteredObject = await waitForTrue(
      checkTextractDataFileContainsStringFromOriginalPdf,
      1000,
      35000
    );
    expect(textractFilteredObject).toBe(true);

    const checkStandardisedFileContainsExpectedFieldsFromOriginalPdf =
      async (): Promise<boolean> => {
        const standardisedFilesContents =
          await getS3FileContentsBasedOnLastModified(
            testStartTime,
            storageBucket,
            standardisedFolderPrefix
          );
        const invoiceNumber = invoice.invoiceNumber;
        const invoiceDate = invoice.date.toISOString().slice(0, 10);
        const invoiceTotal = invoice.getTotal().toFixed(2);
        return standardisedFilesContents.some(
          (standardisedFile) =>
            (standardisedFile?.includes(invoiceNumber) ?? false) &&
            (standardisedFile?.includes(invoiceDate) ?? false) &&
            (standardisedFile?.includes(invoiceTotal) ?? false)
        );
      };
    const standardisedFilteredObject = await waitForTrue(
      checkStandardisedFileContainsExpectedFieldsFromOriginalPdf,
      1000,
      25000
    );
    expect(standardisedFilteredObject).toBe(true);

    const isFileMovedToSuccessfulFolder = async (): Promise<boolean> => {
      const result = await listS3Objects({
        bucketName: s3Object.bucket,
        prefix: "successful",
      });
      if (result.Contents === undefined) {
        return false;
      }
      return result.Contents.some((t) => t.Key?.includes(s3Object.key));
    };

    const originalFileExistsInSuccessfulFolder = await waitForTrue(
      isFileMovedToSuccessfulFolder,
      1000,
      21000
    );
    expect(originalFileExistsInSuccessfulFolder).toBeTruthy();
    await deleteS3Object({
      bucket: s3Object.bucket,
      key: `successful/${String(path)}`,
    });
  });
});

describe("\n Unhappy path - Upload invalid pdf to the raw invoice pdf bucket test\n", () => {
  const uniqueString = Math.random().toString(36).substring(2, 7);
  const rawInvoice: S3Object = {
    bucket: `${prefix}-raw-invoice-pdf`,
    key: `${givenVendorIdFolder}/raw-Invoice-${uniqueString}-validFile.pdf`,
  };

  test("should move the original raw invoice to failed folder in s3 raw-invoice-pdf bucket upon uploading the invalid pdf file ", async () => {
    const file = "../payloads/invalidFiletoTestTextractFailure.pdf";
    const filename = path.join(__dirname, file);
    const fileData = fs.readFileSync(filename);

    await putS3Object({ data: fileData, target: rawInvoice });

    const checkRawPdfFileExists = await checkIfS3ObjectExists(rawInvoice);
    expect(checkRawPdfFileExists).toBeTruthy();

    const isFileMovedToFailedFolder = async (): Promise<boolean> => {
      const result = await listS3Objects({
        bucketName: rawInvoice.bucket,
        prefix: "failed",
      });
      if (result.Contents === undefined) {
        return false;
      }
      return result.Contents.some((items) =>
        items.Key?.includes(rawInvoice.key)
      );
    };
    const originalFileExistsInFailedFolder = await waitForTrue(
      isFileMovedToFailedFolder,
      1000,
      20000
    );
    expect(originalFileExistsInFailedFolder).toBeTruthy();
    await deleteS3Object({
      bucket: rawInvoice.bucket,
      key: "failed/" + rawInvoice.key,
    });
  });
});

const getS3FileContentsBasedOnLastModified = async (
  newerThan: Date,
  bucketName: string,
  folderPrefix?: string
): Promise<Array<string | undefined>> => {
  const result = await listS3Objects({ bucketName, prefix: folderPrefix });
  if (result.Contents === undefined) return [];

  const s3ContentsFilteredByTestStartTime = result.Contents?.filter((item) => {
    return (
      item.LastModified !== undefined &&
      new Date(item.LastModified) >= newerThan
    );
  });
  const filePromises = s3ContentsFilteredByTestStartTime.map(async ({ Key }) =>
    Key === undefined
      ? undefined
      : await getS3Object({
          bucket: bucketName,
          key: Key,
        })
  );
  return await Promise.all(filePromises);
};
