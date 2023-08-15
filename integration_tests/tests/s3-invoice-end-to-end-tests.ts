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
  ContractName,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";

describe("\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n", () => {
  let filename: string;

  test.each`
    testCase           | itemDescriptions                       | expectedServices                       | expectedEvents                                              | vendorId                       | contractName
    ${"non-quarterly"} | ${["address check", "passport check"]} | ${["Address check", "Passport check"]} | ${[EventName.VENDOR_3_EVENT_6, EventName.VENDOR_3_EVENT_4]} | ${VendorId.vendor_testvendor3} | ${ContractName.vendor_testvendor3_contract1} | ${false}
    ${"quarterly"}     | ${["Six Data Validation Application"]} | ${["Six Data Validation Application"]} | ${[EventName.VENDOR_6_EVENT_1]}                             | ${VendorId.vendor_testvendor6} | ${ContractName.vendor_testvendor6_contract1} | ${true}
  `(
    "upload valid $testCase pdf file in raw-invoice bucket and see that we can see the data in the view",
    async (data) => {
      const lineItems = data.itemDescriptions.map((description: string) =>
        randomLineItems(1, { description })
      );
      const invoiceData = randomInvoiceData({
        date: new Date("2023-03-31"),
        lineItems,
      });
      const invoice = new Invoice(invoiceData);
      const expectedSubtotals = data.itemDescriptions.map(
        (description: string) => invoice.getSubtotal(description)
      );
      const expectedQuantities = data.itemDescriptions.map(
        (description: string) => invoice.getQuantity(description)
      );
      filename = `s3-invoice-e2e-test-raw-Invoice-validFile-${data.testCase}`;

      const s3Object = await createInvoiceInS3({
        invoiceData,
        filename: `${filename}.pdf`,
      });

      const checkRawPdfFileExists = await checkIfS3ObjectExists(s3Object);
      expect(checkRawPdfFileExists).toBeTruthy();

      // Check they were standardised
      await Promise.all(
        data.itemDescriptions.map(
          async (description: string, index: number) =>
            await checkStandardised(
              invoice.date,
              invoice.vendor.id,
              { description, event_name: data.expectedEvents[index] },
              description,
              { quarterly: data.invoiceIsQuarterly }
            )
        )
      );
      // Check the view results match the invoice.
      const queryString = `SELECT * FROM "btm_billing_curated" where vendor_id = '${data.vendorId}'`;
      const queryObjects = await queryAthena<BillingCurated>(queryString);
      expect(queryObjects.length).toEqual(2);
      queryObjects.sort((q0, q1) => {
        return q0.service_name.localeCompare(q1.service_name);
      });
      for (let i = 0; i < queryObjects.length; i++) {
        expect(invoice.vendor.id).toEqual(queryObjects[i].vendor_id);
        expect(invoice.vendor.name).toEqual(queryObjects[i].vendor_name);
        expect(data.expectedServices[i]).toEqual(queryObjects[i].service_name);
        expect(data.contractName).toEqual(queryObjects[i].contract_name);
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
    }
  );

  test.each`
    testCase           | invoiceTime     | itemDescriptions                                    | vendorId                       | expectedEvents                                              | expectedServices                       | expectedMonthString | expectedContractId
    ${"non-quarterly"} | ${"2023-03-31"} | ${["Fraud check", "Passport check", "Long weight"]} | ${VendorId.vendor_testvendor1} | ${[EventName.VENDOR_1_EVENT_1, EventName.VENDOR_1_EVENT_3]} | ${["Passport check", "Fraud check"]}   | ${"03"}             | ${ContractName.vendor_testvendor1_contract1}
    ${"quarterly"}     | ${"2023-03-31"} | ${["Six Data Validation Application"]}              | ${VendorId.vendor_testvendor6} | ${[EventName.VENDOR_6_EVENT_1, EventName.VENDOR_6_EVENT_1]} | ${["Six Data Validation Application"]} | ${"01"}             | ${ContractName.vendor_testvendor6_contract1}
  `(
    "upload valid $testCase csv file in raw-invoice bucket and check that we can see the data in the view",
    async (data) => {
      // Step 1: Put random creation of a csv invoice file in the raw-invoice bucket.
      // Note: For the csv invoice flow, the original does not get moved to a 'successful folder' like it does for the pdf invoice flow that invokes Textract.

      const invoiceData = randomInvoiceData({
        date: new Date(data.invoiceTime),
        lineItems: data.itemDescriptions.map((description: string) =>
          randomLineItem({ description, quantity: 100 })
        ),
        vendor: {
          id: data.vendorId,
          name: prettyVendorNameMap[
            data.vendorId as keyof typeof prettyVendorNameMap
          ],
        },
      });

      await createInvoiceInS3({
        invoiceData,
        filename: `${filename}.csv`,
      });

      const invoice = new Invoice(invoiceData);

      // Check they were standardised
      await Promise.all(
        data.expectedEvents.map(
          async (event: string, index: number) =>
            await checkStandardised(
              invoice.date,
              invoice.vendor.id,
              {
                description: data.expectedServices[index],
                event_name: event,
              },
              data.expectedServices[index]
            )
        )
      );

      // Step 3: Check the view results match the original csv invoice.
      const queryString = `SELECT * FROM "btm_billing_curated" where vendor_id = '${
        invoice.vendor.id
      }' AND year='${invoice.date.getFullYear()}' AND month='${
        data.expectedMonthString
      }' ORDER BY service_name ASC`;

      const response = await queryAthena<BillingCurated>(queryString);
      expect(response.length).toEqual(data.expectedServices.length);

      response.forEach((row, index) => {
        const expectedService = data.expectedServices[index];
        expect(row.vendor_name).toEqual(invoice.vendor.name);
        expect(row.service_name).toEqual(expectedService);
        expect(row.contract_name).toEqual(data.expectedContractId);
        expect(row.quantity).toEqual(
          invoice.getQuantity(expectedService).toString()
        );
        expect(row.price).toEqual(invoice.lineItems[index].subtotal.toFixed(4));
        expect(row.tax).toEqual(invoice.lineItems[index].vat.toFixed(4));
        expect(row.year).toEqual(invoice.date.getFullYear().toString());
        expect(row.month).toEqual(data.expectedMonthString);
      });
    }
  );
});

export interface BillingCurated {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  contract_name: string;
  event_name: string;
  quantity: string;
  price: string;
  tax: string;
  year: string;
  month: string;
}
