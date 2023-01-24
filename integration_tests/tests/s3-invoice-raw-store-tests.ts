import {
  deleteObjectInS3,
  checkIfS3ObjectExists,
  getS3ItemsList,
  getS3Object,
  putObjectToS3,
  S3Object,
} from "../helpers/s3Helper";
import path from "path";
import fs from "fs";
import { resourcePrefix } from "../helpers/envHelper";
import { waitForTrue } from "../helpers/commonHelpers";

import {
  makeMockInvoicePDF,
  randomInvoice,
  writeInvoiceToS3,
} from "../helpers/mock-data/invoice";

const prefix = resourcePrefix();
const testStartTime = new Date();
const givenVendorFolder = "vendor-name";

describe("\n Happy path - Upload valid mock invoice pdf to the raw invoice pdf bucket test\n", () => {
  const storageBucket = `${prefix}-storage`;
  const textractBucket = `${prefix}-raw-invoice-textract-data`;
  const standardisedFolderPrefix = "btm_billing_standardised";
  const invoice = randomInvoice();
  test("raw-invoice-textract-data and storage buckets should contain textracted and standardised data file for uploaded valid pdf file in raw-invoice-pdf bucket and should move the original raw invoice to successful folder in s3 raw-invoice-pdf bucket", async () => {
    const { bucketName, path } = await makeMockInvoicePDF(writeInvoiceToS3)(
      invoice,
      givenVendorFolder
    );
    const checkRawPdfFileExists = await checkIfS3ObjectExists({
      bucket: bucketName,
      key: path,
    });
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const checkTextractDataFileContainsStringFromOriginalPdf =
      async (): Promise<boolean> => {
        const textractedFileContents =
          await getS3FileContentsBasedOnLastModified(textractBucket);
        return textractedFileContents.some((file) =>
          file?.includes(invoice.invoiceNumber)
        );
      };

    const textractFilteredObject = await waitForTrue(
      checkTextractDataFileContainsStringFromOriginalPdf,
      1000,
      35000
    );
    console.log(textractFilteredObject);
    expect(textractFilteredObject).toBe(true);

    const checkStandardisedFileContainsExpectedFiledsFromOriginalPdf =
      async (): Promise<boolean> => {
        const standardisedFilesContents =
          await getS3FileContentsBasedOnLastModified(
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
      checkStandardisedFileContainsExpectedFiledsFromOriginalPdf,
      1000,
      25000
    );
    expect(standardisedFilteredObject).toBe(true);

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
    await deleteObjectInS3({
      bucket: bucketName,
      key: `successful/${String(path)}`,
    });
    console.log("deleted the file from s3");
  });
});

describe("\n Unappy path - Upload invalid pdf to the raw invoice pdf bucket test\n", () => {
  const uniqueString = Math.random().toString(36).substring(2, 7);
  const rawInvoice: S3Object = {
    bucket: `${prefix}-raw-invoice-pdf`,
    key: `${givenVendorFolder}/raw-Invoice-${uniqueString}-validFile.pdf`,
  };

  test("should move the original raw invoice to failed folder in s3 raw-invoice-pdf bucket upon uploading the invalid pdf file ", async () => {
    const file = "../payloads/invalidFiletoTestTextractFailure.pdf";
    const filename = path.join(__dirname, file);
    const fileStream = fs.createReadStream(filename);

    await putObjectToS3(rawInvoice, fileStream);

    const checkRawPdfFileExists = await checkIfS3ObjectExists(rawInvoice);
    expect(checkRawPdfFileExists).toBeTruthy();
    console.log("file exists in raw invoice pdf bucket");

    const isFileMovedToFailedFolder = async (): Promise<boolean> => {
      const result = await getS3ItemsList(rawInvoice.bucket, "failed");
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
    await deleteObjectInS3({
      bucket: rawInvoice.bucket,
      key: "failed/" + rawInvoice.key,
    });
    console.log("deleted the file from s3");
  });
});

const getS3FileContentsBasedOnLastModified = async (
  bucketName: string,
  folderPrefix?: string
): Promise<Array<string | undefined>> => {
  const result = await getS3ItemsList(bucketName, folderPrefix);
  if (result.Contents === undefined) {
    throw new Error("No files found");
  }
  const s3ContentsFilteredByTestStartTime = result.Contents?.filter((item) => {
    return (
      item.LastModified !== undefined && item.LastModified >= testStartTime
    );
  });
  console.log("Files", s3ContentsFilteredByTestStartTime);
  const filePromises = s3ContentsFilteredByTestStartTime.map(async ({ Key }) =>
    Key === undefined
      ? undefined
      : await getS3Object({
          bucket: bucketName,
          key: Key,
        })
  );
  const files = await Promise.all(filePromises);
  return files;
};
