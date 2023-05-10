import path from "path";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  checkIfS3ObjectExists,
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
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";

const prefix = resourcePrefix();

describe("\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n", () => {
  const storageBucket = `${prefix}-storage`;
  const standardisedFolderPrefix = "btm_invoice_data";
  let filename: string;

  test("upload valid pdf file in raw-invoice bucket and see that we can see the data in the view", async () => {
    const passportCheckItems = randomLineItems(1, {
      description: "passport check",
    });
    const addressCheckItems = randomLineItems(1, {
      description: "address check",
    });
    const invoice = randomInvoice({
      date: new Date("2023-03-31"),
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
    filename = `s3-invoice-e2e-test-raw-Invoice-validFile`;

    const s3Object = await createInvoiceInS3({
      invoiceData: invoice,
      filename: `${filename}.pdf`,
    });

    const checkRawPdfFileExists = await checkIfS3ObjectExists(s3Object);
    expect(checkRawPdfFileExists).toBeTruthy();

    // Wait for the invoice data to have been written, to files in the standardised folder.
    await poll(
      async () =>
        await listS3Objects({
          bucketName: storageBucket,
          prefix: standardisedFolderPrefix,
        }),
      (Contents) =>
        Contents?.filter((s3Object) =>
          s3Object.key?.includes(
            `${standardisedFolderPrefix}/2023/03/2023-03-vendor_testvendor3-VENDOR_3_EVENT`
          )
        ).length === 2,
      {
        timeout: 120000,
        interval: 10000,
        notCompleteErrorMessage:
          "PDF Invoice data never appeared in standardised folder",
      }
    );

    // Check the view results match the invoice.
    const queryString = `SELECT * FROM "btm_billing_curated" where vendor_id = 'vendor_testvendor3'`;
    const queryObjects = await queryAthena<BillingCurated>(queryString);
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
      expect(queryObjects[i].price).toMatch(expectedSubtotals[i].toFixed(2));
      expect(+queryObjects[i].quantity).toEqual(expectedQuantities[i]);
    }

    // Check that the invoice got moved to the success folder.
    const isFileMovedToSuccessfulFolder = async (): Promise<boolean> => {
      const result = await listS3Objects({
        bucketName: s3Object.bucket,
        prefix: "successful",
      });
      if (result === undefined) {
        return false;
      }
      return result.some((t) => t.key?.includes(s3Object.key));
    };

    const pollOptions = {
      notCompleteErrorMessage:
        "File was not moved to successful folder within the timeout",
    };

    const originalFileExistsInSuccessfulFolder = await poll(
      isFileMovedToSuccessfulFolder,
      (resolution) => resolution,
      pollOptions
    );

    expect(originalFileExistsInSuccessfulFolder).toBeTruthy();
    await deleteS3Objects({
      bucket: s3Object.bucket,
      keys: [`successful/${s3Object.key}`],
    });
  });

  test("upload valid csv file in raw-invoice bucket and check that we can see the data in the view", async () => {
    // Step 1: Put the test csv file in the raw-invoice bucket. A further ticket will handle the random creation of a csv invoice, similar to the pdf invoice.
    // Note: For the csv invoice flow, the original does not get moved to a 'successful folder' like it does for the pdf invoice flow that invokes Textract.

    filename = "valid-vendor1-invoice";
    const folderPrefix = "vendor_testvendor1";
    const testObject: S3Object = {
      bucket: `${prefix}-raw-invoice`,
      key: `${folderPrefix}/${filename}.csv`,
    };
    const csv = `../payloads/${filename}.csv`;
    const filePath = path.join(__dirname, csv);
    const fileData = fs.readFileSync(filePath);
    await putS3Object({ data: fileData, target: testObject });

    const checkRawCsvFileExists = await checkIfS3ObjectExists(testObject);
    expect(checkRawCsvFileExists).toBeTruthy();

    // Step 2: Wait for the invoice data to be standardised and saved in the storage bucket/btm_invoice_data.

    await poll(
      async () =>
        await listS3Objects({
          bucketName: storageBucket,
          prefix: standardisedFolderPrefix,
        }),
      (Contents) =>
        Contents?.filter((s3Object) =>
          s3Object.key?.includes(
            `${standardisedFolderPrefix}/2023/03/2023-03-vendor_testvendor1-VENDOR_1_EVENT`
          )
        ).length === 2,
      {
        timeout: 80000,
        notCompleteErrorMessage:
          "CSV Invoice data never appeared in standardised folder",
      }
    );

    // Step 3: Check the view results match the original csv invoice. Hard coded for now based on the csv in the payloads folder.
    const queryString = `SELECT * FROM "btm_billing_curated" where vendor_id = 'vendor_testvendor1' AND year='${"2023"}' AND month='${"03"}' ORDER BY service_name ASC`;
    const response = await queryAthena<BillingCurated>(queryString);
    expect(response.length).toEqual(2);

    expect(response[0].vendor_name).toEqual("Vendor One");
    expect(response[0].service_name).toEqual("Fraud check");
    expect(response[0].quantity).toEqual("83");
    expect(response[0].price).toEqual("327.8500");
    expect(response[0].year).toEqual("2023");
    expect(response[0].month).toEqual("03");

    expect(response[1].vendor_name).toEqual("Vendor One");
    expect(response[1].service_name).toEqual("Passport check");
    expect(response[1].quantity).toEqual("13788");
    expect(response[1].price).toEqual("4687.9200");
    expect(response[1].year).toEqual("2023");
    expect(response[1].month).toEqual("03");
  });
});

interface BillingCurated {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  quantity: string;
  price: string;
  year: string;
  month: string;
}
