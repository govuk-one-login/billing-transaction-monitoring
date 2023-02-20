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
import {
  poll,
  waitForTrue,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { randomInvoice } from "../../src/handlers/int-test-support/helpers/mock-data/invoice";
import { createInvoiceInS3 } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";

const prefix = resourcePrefix();
const givenVendorIdFolder = "vendor123";

describe("\n Happy path - Upload valid mock invoice pdf to the raw invoice pdf bucket test\n", () => {
  const storageBucket = `${prefix}-storage`;
  const textractBucket = `${prefix}-raw-invoice-textract-data`;
  const standardisedFolderPrefix = "btm_billing_standardised";
  const invoice = randomInvoice();
  test("raw-invoice-textract-data and storage buckets should contain textracted and standardised data file for uploaded valid pdf file in raw-invoice-pdf bucket and should move the original raw invoice to successful folder in s3 raw-invoice-pdf bucket", async () => {
    const filename = `raw-Invoice-${Math.random()
      .toString(36)
      .substring(2, 7)}-validFile`;
    const s3Object = await createInvoiceInS3(invoice, `${filename}.pdf`);
    const isInvoiceUploadSuccessful = await checkIfS3ObjectExists(s3Object);
    if (!isInvoiceUploadSuccessful) {
      throw new Error("Raw invoice was not uploaded");
    }

    // wait for invoice to be uploaded to raw bucket
    await poll(
      async () =>
        await listS3Objects({
          bucketName: textractBucket,
        }),
      (results) =>
        !!results?.Contents?.some(({ Key }) => Key?.includes(filename)),
      {
        timeout: 45000,
        nonCompleteErrorMessage: "Invoice was not successfully uploaded",
      }
    );

    // wait for standardised invoice to appear
    await poll(
      async () =>
        await listS3Objects({
          bucketName: storageBucket,
          prefix: standardisedFolderPrefix,
        }),
      (results) =>
        !!results?.Contents?.some(({ Key }) => Key?.includes(filename)),
      {
        nonCompleteErrorMessage: "Standardised invoice never materialised",
      }
    );

    // fetch the standardised invoice
    const standardisedInvoice = await getS3Object({
      bucket: storageBucket,
      key: `${standardisedFolderPrefix}/${filename}.txt`,
    });

    // check the standardised invoice contains what we expect it to
    expect(standardisedInvoice).toMatch(invoice.invoiceNumber);
    expect(standardisedInvoice).toMatch(
      invoice.date.toISOString().slice(0, 10)
    );
    expect(standardisedInvoice).toMatch(invoice.getTotal().toFixed(2));

    // check the original invoice has been moved to the successful folder
    const { Contents: successfulFolderContents } = await listS3Objects({
      bucketName: s3Object.bucket,
      prefix: "successful",
    });
    const isFileInSuccessFolder = successfulFolderContents?.some(({ Key }) =>
      Key?.includes(filename)
    );
    expect(isFileInSuccessFolder).toBe(true);
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
