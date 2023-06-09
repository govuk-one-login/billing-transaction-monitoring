import {
  checkIfS3ObjectExists,
  deleteS3Objects,
  listS3Objects,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  Invoice,
  randomInvoiceData,
  randomLineItems,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice";
import {
  checkStandardised,
  createInvoiceInS3,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { randomLineItem } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/random";
import {
  EventName,
  VendorId,
  prettyVendorNameMap,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";

describe("\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n", () => {
  let filename: string;

  test("upload valid pdf file in raw-invoice bucket and see that we can see the data in the view", async () => {
    const passportCheckItems = randomLineItems(1, {
      description: "passport check",
    });
    const addressCheckItems = randomLineItems(1, {
      description: "address check",
    });
    const invoiceData = randomInvoiceData({
      date: new Date("2023-03-31"),
      lineItems: [...passportCheckItems, ...addressCheckItems],
    });
    const invoice = new Invoice(invoiceData);
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
      invoiceData,
      filename: `${filename}.pdf`,
    });

    const checkRawPdfFileExists = await checkIfS3ObjectExists(s3Object);
    expect(checkRawPdfFileExists).toBeTruthy();

    // Check they were standardised
    await Promise.all([
      checkStandardised(
        invoice.date,
        invoice.vendor.id,
        {
          description: invoice.lineItems[0].description,
          event_name: EventName.VENDOR_3_EVENT_6,
        },
        "address check"
      ),
      checkStandardised(
        invoice.date,
        invoice.vendor.id,
        {
          description: invoice.lineItems[1].description,
          event_name: EventName.VENDOR_3_EVENT_4,
        },
        "passport check"
      ),
    ]);
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
    // Step 1: Put random creation of a csv invoice file in the raw-invoice bucket.
    // Note: For the csv invoice flow, the original does not get moved to a 'successful folder' like it does for the pdf invoice flow that invokes Textract.

    const invoiceData = randomInvoiceData({
      date: new Date("2023-03-31"),
      lineItems: [
        randomLineItem({ description: "Fraud check", quantity: 100 }),
        randomLineItem({ description: "Passport check", quantity: 100 }),
        randomLineItem({ description: "Long weight", quantity: 100 }),
      ],
      vendor: {
        id: VendorId.vendor_testvendor1,
        name: prettyVendorNameMap[VendorId.vendor_testvendor1],
      },
    });

    await createInvoiceInS3({
      invoiceData,
      filename: `${filename}.csv`,
    });

    const invoice = new Invoice(invoiceData);

    // Check they were standardised
    await Promise.all([
      checkStandardised(
        invoice.date,
        invoice.vendor.id,
        {
          description: invoice.lineItems[0].description,
          event_name: EventName.VENDOR_1_EVENT_1,
        },
        "Passport Check"
      ),
      checkStandardised(
        invoice.date,
        invoice.vendor.id,
        {
          description: invoice.lineItems[1].description,
          event_name: EventName.VENDOR_1_EVENT_3,
        },
        "Fraud Check"
      ),
    ]);

    // Step 3: Check the view results match the original csv invoice.
    const queryString = `SELECT * FROM "btm_billing_curated" where vendor_id = '${
      invoice.vendor.id
    }' AND year='${invoice.date.getFullYear()}' AND month='${(
      invoice.date.getMonth() + 1
    ).toLocaleString("en-US", {
      minimumIntegerDigits: 2,
    })}' ORDER BY service_name ASC`;

    const response = await queryAthena<BillingCurated>(queryString);
    expect(response.length).toEqual(2);

    expect(response[0].vendor_name).toEqual(invoice.vendor.name);
    expect(response[0].service_name).toEqual("Fraud check");
    expect(response[0].quantity).toEqual(
      invoice.getQuantity("Fraud check").toString()
    );
    expect(response[0].price).toEqual(invoice.lineItems[0].subtotal.toFixed(4));
    expect(response[0].tax).toEqual(invoice.lineItems[0].vat.toFixed(4));
    expect(response[0].year).toEqual(invoice.date.getFullYear().toString());
    expect(response[0].month).toEqual(
      (invoice.date.getMonth() + 1).toLocaleString("en-US", {
        minimumIntegerDigits: 2,
      })
    );

    expect(response[1].vendor_name).toEqual(invoice.vendor.name);
    expect(response[1].service_name).toEqual("Passport check");
    expect(response[1].quantity).toEqual(
      invoice.getQuantity("Passport check").toString()
    );
    expect(response[1].price).toEqual(invoice.lineItems[1].subtotal.toFixed(4));
    expect(response[1].tax).toEqual(invoice.lineItems[1].vat.toFixed(4));
    expect(response[1].year).toEqual(invoice.date.getFullYear().toString());
    expect(response[1].month).toEqual(
      (invoice.date.getMonth() + 1).toLocaleString("en-US", {
        minimumIntegerDigits: 2,
      })
    );
  });
});

interface BillingCurated {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  quantity: string;
  price: string;
  tax: string;
  year: string;
  month: string;
}
