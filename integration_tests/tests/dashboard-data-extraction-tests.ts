import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";
import {
  S3Object,
  getS3Object,
  putS3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import crypto from "crypto";
import { ContractName } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  getQuarterMonthString,
  padZero,
} from "../../src/handlers/int-test-support/helpers/dateHelper";

describe("\n DashboardDataExtractFunction", () => {
  test.each`
    testCase           | vendorId                | vendorName       | invoiceReceiptDate | dueDate         | originalInvoiceFile      | invoiceIsQuarterly | eventName             | itemDescription                       | serviceName                           | contractId | contractName
    ${"non-quarterly"} | ${"vendor_testvendor5"} | ${"Vendor Five"} | ${"2005-05-31"}    | ${"2005-06-30"} | ${"pdf_testvendor5.pdf"} | ${false}           | ${"VENDOR_5_EVENT_1"} | ${"Five Data Validation Application"} | ${"Five Data Validation Application"} | ${"5"}     | ${ContractName.vendor_testvendor5_contract1}
    ${"quarterly"}     | ${"vendor_testvendor6"} | ${"Vendor Six"}  | ${"2005-06-30"}    | ${"2005-07-31"} | ${"pdf_testvendor6.pdf"} | ${true}            | ${"VENDOR_6_EVENT_1"} | ${"Six Data Validation Application"}  | ${"Six Data Validation Application"}  | ${"6"}     | ${ContractName.vendor_testvendor6_contract1}
  `(
    "should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised $testCase invoice data is stored in s3",
    async (data) => {
      const minQuantity = 1000;
      const maxQuantity = 20000;
      const quantity = crypto.randomInt(minQuantity, maxQuantity);
      const unit_price = 0.32;
      const subtotal = parseFloat((unit_price * quantity).toFixed(2));
      const tax = parseFloat((subtotal * 0.2).toFixed(2));
      const total = parseFloat((subtotal + tax).toFixed(2));

      const standardisedInvoiceObject = {
        invoice_receipt_id: crypto.randomBytes(5).toString("hex"),
        vendor_id: data.vendorId,
        vendor_name: data.vendorName,
        total,
        invoice_receipt_date: new Date(data.invoiceReceiptDate),
        subtotal,
        due_date: data.dueDate,
        tax_payer_id: `GB${crypto
          .randomBytes(4)
          .toString("hex")
          .toUpperCase()}`,
        parser_version: "default_1.3.0",
        originalInvoiceFile: data.originalInvoiceFile,
        invoice_is_quarterly: data.invoiceIsQuarterly,
        tax,
        event_name: data.eventName,
        item_description: data.itemDescription,
        price: subtotal,
        quantity,
        service_name: data.serviceName,
        contract_id: data.contractId,
        unit_price,
      };

      const uuid = crypto.randomBytes(3).toString("hex");
      const year = standardisedInvoiceObject.invoice_receipt_date.getFullYear();
      const month = standardisedInvoiceObject.invoice_is_quarterly
        ? getQuarterMonthString(standardisedInvoiceObject.invoice_receipt_date)
        : padZero(
            standardisedInvoiceObject.invoice_receipt_date.getMonth() + 1
          );

      const s3Object: S3Object = {
        bucket: `${resourcePrefix()}-storage`,
        key: `btm_invoice_data/${year}/${month}/${year}-${month}-${data.vendorId}-${data.eventName}-${uuid}.txt`,
      };

      // Upload standardised invoice data to s3 storage bucket
      await putS3Object({
        data: JSON.stringify(standardisedInvoiceObject),
        target: s3Object,
      });

      // Wait for the DashboardDataExtractFunction to have stored the data in full-extract.json
      await poll(
        async () =>
          await getS3Object({
            bucket: `${resourcePrefix()}-storage`,
            key: `btm_extract_data/full-extract.json`,
          }),
        (result) => {
          return result?.includes(quantity.toString()) ?? false;
        },
        {
          timeout: 280000,
          interval: 70000,
          notCompleteErrorMessage: `Standardised Invoice data not found in storage/btm_extract_data/full-extract.json`,
        }
      );
      // Check the btm_monthly_extract table results match with uploaded standardised invoice data object.
      const queryString = `SELECT * FROM "btm_monthly_extract" where vendor_id ='${standardisedInvoiceObject.vendor_id}' AND year='${year}' AND month='${month}'`;
      const response = await queryAthena<BtmMonthlyExtract>(queryString);
      expect(response.length).toEqual(1);
      expect(response[0].vendor_id).toEqual(
        standardisedInvoiceObject.vendor_id
      );
      expect(response[0].vendor_name).toEqual(
        standardisedInvoiceObject.vendor_name
      );
      expect(response[0].service_name).toEqual(
        standardisedInvoiceObject.service_name
      );
      expect(response[0].contract_id).toEqual(
        standardisedInvoiceObject.contract_id
      );
      expect(response[0].contract_name).toEqual(data.contractName);
      expect(response[0].year).toEqual(year.toString());
      expect(response[0].month).toEqual(month.toString());
      expect(response[0].billing_unit_price).toEqual(
        "£" + standardisedInvoiceObject.unit_price.toFixed(4)
      );
      expect(response[0].billing_price_formatted).toEqual(
        standardisedInvoiceObject.subtotal.toLocaleString("en-GB", {
          style: "currency",
          currency: "GBP",
        })
      );
      expect(response[0].transaction_price_formatted).toEqual("");
      expect(response[0].price_difference).toEqual("");
      expect(response[0].billing_quantity).toEqual(
        standardisedInvoiceObject.quantity.toString()
      );
      expect(response[0].transaction_quantity).toEqual("");
      expect(response[0].quantity_difference).toEqual("");
      expect(response[0].billing_amount_with_tax).toEqual(
        standardisedInvoiceObject.total.toLocaleString("en-GB", {
          style: "currency",
          currency: "GBP",
        })
      );
      expect(response[0].price_difference_percentage).toEqual("-1234567.04"); // Code for 'transaction data missing'
      expect(response[0].invoice_is_quarterly).toEqual(
        data.invoiceIsQuarterly.toString()
      );
    }
  );
});

interface BtmMonthlyExtract {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  contract_id: string;
  contract_name: string;
  year: string;
  month: string;
  billing_unit_price: string;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference: string;
  billing_quantity: string;
  transaction_quantity: string;
  quantity_difference: string;
  billing_amount_with_tax: string;
  price_difference_percentage: number;
  invoice_is_quarterly: string;
}
