import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  checkIfS3ObjectExists,
  deleteS3Objects,
  listS3Objects,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  makeMockInvoiceCSV,
  randomInvoice,
  randomLineItems,
  writeInvoiceToS3,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice";
import {
  queryObject,
  startQueryExecutionCommand,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";
import { createInvoiceInS3 } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { randomString } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/random";
import { getE2ETestConfig } from "../../src/handlers/int-test-support/config-utils/get-e2e-test-config";
import {
  checkStandardised,
  getRandomInvoiceDate,
} from "./s3-invoice-standardised-line-item-tests";

const prefix = resourcePrefix();

describe("\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n", () => {
  const storageBucket = `${prefix}-storage`;
  const standardisedFolderPrefix = "btm_invoice_data";
  const databaseName = `${prefix}-calculations`;
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
      ({ Contents }) =>
        Contents?.filter((s3Object) =>
          s3Object.Key?.includes(
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

  test.only("upload valid csv file in raw-invoice bucket and check that we can see the data in the view", async () => {
    // Step 1: Put the test csv file in the raw-invoice bucket. A further ticket will handle the random creation of a csv invoice, similar to the pdf invoice.
    // Note: For the csv invoice flow, the original does not get moved to a 'successful folder' like it does for the pdf invoice flow that invokes Textract.
    const date = getRandomInvoiceDate();
    console.log(date);

    // Get vendor that uses default PDF parser
    const {
      parser_default_vendor_id: vendorId,
      parser_default_service_1: givenVendorService1,
    } = await getE2ETestConfig();

    const invoice = randomInvoice({
      date,
      lineItemCount: 1,
      lineItemOptions: {
        description: givenVendorService1.description,
      },
      vendor: {
        id: vendorId,
        name: "Vendor Two",
      },
    });
    console.log(invoice);
    const mockCSVInvoice = await makeMockInvoiceCSV(writeInvoiceToS3)(
      invoice,
      invoice.vendor.id,
      `${randomString(8)}.csv`
    );

    console.log(mockCSVInvoice);

    const standardised = await checkStandardised(
      date,
      invoice.vendor.id,
      givenVendorService1,
      "Passport check"
    );
    console.log(standardised);

    // Step 3: Check the view results match the original csv invoice. Hard coded for now based on the csv in the payloads folder.
    const queryString = `SELECT * FROM "btm_billing_curated" where vendor_id = 'vendor_testvendor1' AND year='${"2023"}' AND month='${"03"}' ORDER BY service_name ASC`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryObjects: BillingCurated[] = await queryObject(queryId);
    expect(queryObjects.length).toEqual(2);

    expect(queryObjects[0].vendor_name).toEqual(invoice.vendor.name);
    expect(queryObjects[0].service_name).toEqual("Passport check");
    expect(queryObjects[0].quantity).toEqual(
      invoice.getQuantity("Passport check")
    );
    expect(queryObjects[0].price).toEqual(invoice.getSubtotal());
    expect(queryObjects[0].year).toEqual(invoice.date.getFullYear());
    expect(queryObjects[0].month).toEqual(invoice.date.getMonth() + 1);

    expect(queryObjects[1].vendor_name).toEqual("Vendor One");
    expect(queryObjects[1].service_name).toEqual("Passport check");
    expect(queryObjects[1].quantity).toEqual("13788");
    expect(queryObjects[1].price).toEqual("4687.9200");
    expect(queryObjects[1].year).toEqual("2023");
    expect(queryObjects[1].month).toEqual("03");
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
