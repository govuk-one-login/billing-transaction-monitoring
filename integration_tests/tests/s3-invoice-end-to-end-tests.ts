import path from "path";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  checkIfS3ObjectExists,
  deleteS3Object,
  deleteS3Objects,
  listS3Objects,
  putS3Object,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  randomInvoice,
  randomLineItems,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice";
import { createInvoiceInS3 } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import fs from "fs";
import {
  queryObject,
  startQueryExecutionCommand,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";

const prefix = resourcePrefix();
const testStartTime = new Date();

describe("\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n", () => {
  const storageBucket = `${prefix}-storage`;
  const standardisedFolderPrefix = "btm_billing_standardised";
  const databaseName = `${prefix}-calculations`;

  beforeAll(async () => {
    await deleteS3Objects({
      bucketName: storageBucket,
      prefix: standardisedFolderPrefix,
    });
  });

  test("upload valid pdf file in raw-invoice bucket and check that we can see the data in the view", async () => {
    const passportCheckItems = randomLineItems(8, {
      description: "passport check",
    });
    const addressCheckItems = randomLineItems(10, {
      description: "address check",
    });
    const invoice = randomInvoice({
      lineItems: [...passportCheckItems, ...addressCheckItems],
    });
    const expectedSubtotals = [
      invoice.getSubtotal("address check"),
      invoice.getSubtotal("passport check"),
    ];
    const expectedQuantities = [
      invoice.getQuantity("address check"),
      invoice.getQuantity("passport check"),
    ];
    const expectedServices = ["Address check", "Passport check"];
    const filename = `raw-Invoice-${Math.random()
      .toString(36)
      .substring(2, 7)}-validFile`;
    const s3Object = await createInvoiceInS3({
      invoiceData: invoice,
      filename: `${filename}.pdf`,
    });
    console.log("e2e test invoice filename:", filename);
    const checkRawPdfFileExists = await checkIfS3ObjectExists(s3Object);
    expect(checkRawPdfFileExists).toBeTruthy();

    // Wait for the invoice data to have been written, to some file in the standardised folder.
    await poll(
      async () =>
        await listS3Objects({
          bucketName: storageBucket,
          prefix: standardisedFolderPrefix,
        }),
      ({ Contents }) =>
        !!Contents?.some(
          (s3Object) =>
            s3Object.LastModified !== undefined &&
            new Date(s3Object.LastModified) >= testStartTime
        ),
      {
        timeout: 50000,
        nonCompleteErrorMessage:
          "Invoice data never appeared in standardised folder",
      }
    );

    // Check the view results match the invoice.
    const queryString =
      'SELECT * FROM "btm_billing_curated" ORDER BY vendor_id DESC, year DESC';
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryObjects: BillingCurated[] = await queryObject(queryId);
    expect(queryObjects.length).toEqual(2);
    queryObjects.sort((q0, q1) => {
      return q0.service_name.localeCompare(q1.service_name);
    });
    for (let i = 0; i < queryObjects.length; i++) {
      expect(invoice.vendor.id).toEqual(queryObjects[i].vendor_id);
      expect(invoice.vendor.name).toEqual(queryObjects[i].vendor_name);
      expect(expectedServices[i]).toEqual(queryObjects[i].service_name);
      expect(invoice.date.getFullYear()).toEqual(+queryObjects[i].year);
      expect(invoice.date.getMonth() + 1).toEqual(+queryObjects[i].month);
      expect(queryObjects[i].quantity.toString()).toEqual(
        queryObjects[i].quantity
      );
      expect(queryObjects[i].price).toMatch(expectedSubtotals[i].toFixed(2));
      expect(+queryObjects[i].quantity).toEqual(expectedQuantities[i]);
    }

    // Check that the invoice got moved to the success folder.
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

    const pollOptions = {
      nonCompleteErrorMessage:
        "File was not moved to successful folder within the timeout",
    };

    const originalFileExistsInSuccessfulFolder = await poll(
      isFileMovedToSuccessfulFolder,
      (resolution) => resolution,
      pollOptions
    );

    expect(originalFileExistsInSuccessfulFolder).toBeTruthy();
    await deleteS3Object({
      bucket: s3Object.bucket,
      key: `successful/${String(path)}`,
    });
  });

  test("upload valid csv file in raw-invoice bucket and check that we can see the data in the view", async () => {
    // Step 1: Put the test csv file in the raw-invoice bucket. A further ticket will handle the random creation of a csv invoice, similar to the pdf invoice.
    // Note: For the csv invoice flow, the original does not get moved to a 'successful folder' like it does for the pdf invoice flow that invokes Textract.

    const folderPrefix = "vendor_testvendor1";
    const testObject: S3Object = {
      bucket: `${prefix}-raw-invoice`,
      key: `${folderPrefix}/valid-invoice.csv`,
    };
    const csv = "../payloads/valid-invoice.csv";
    const filePath = path.join(__dirname, csv);
    const fileData = fs.readFileSync(filePath);
    await putS3Object({ data: fileData, target: testObject });

    const checkRawCsvFileExists = await checkIfS3ObjectExists(testObject);
    expect(checkRawCsvFileExists).toBeTruthy();

    // Step 2: Wait for the invoice data to be standardised and saved in the storage bucket/btm_billing_standardised.

    await poll(
      async () =>
        await listS3Objects({
          bucketName: storageBucket,
          prefix: standardisedFolderPrefix,
        }),
      ({ Contents }) =>
        !!Contents?.some(
          (s3Object) =>
            s3Object.Key !== undefined &&
            s3Object.Key === `btm_billing_standardised/valid-invoice.txt`
        ),
      {
        timeout: 60000,
        nonCompleteErrorMessage:
          "Invoice data never appeared in standardised folder",
      }
    );

    // Step 3: Check the view results match the original csv invoice. Hard coded for now based on the csv in the payloads folder.
    const queryString = `SELECT * FROM "btm_billing_curated" where vendor_id = 'vendor_testvendor1'`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryObjects: BillingCurated[] = await queryObject(queryId);
    expect(queryObjects.length).toEqual(2);

    expect(queryObjects[0].vendor_name).toEqual("Vendor One");
    expect(queryObjects[0].service_name).toEqual("Passport check");
    expect(queryObjects[0].quantity).toEqual("13788");
    expect(queryObjects[0].price).toEqual("4687.9200");
    expect(queryObjects[0].year).toEqual("2023");
    expect(queryObjects[0].month).toEqual("02");

    expect(queryObjects[1].vendor_name).toEqual("Vendor One");
    expect(queryObjects[1].service_name).toEqual("Fraud check");
    expect(queryObjects[1].quantity).toEqual("83");
    expect(queryObjects[1].price).toEqual("327.8500");
    expect(queryObjects[1].year).toEqual("2023");
    expect(queryObjects[1].month).toEqual("02");
  });
});

interface BillingCurated {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  quantity: number;
  price: number;
  year: string;
  month: string;
}
