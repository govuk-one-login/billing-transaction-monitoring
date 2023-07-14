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

describe("\n DashboardDataExtractFunction", () => {
  test("should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised invoice data is stored in s3", async () => {
    const standardisedInvoiceObject = {
      invoice_receipt_id: "bme-653950781",
      vendor_id: "vendor_testvendor5",
      vendor_name: "Vendor Five",
      total: 4933.13,
      invoice_receipt_date: new Date("2005-05-31"),
      subtotal: 4110.94,
      due_date: "2005-06-30",
      tax_payer_id: "GB72937880",
      parser_version: "default_1.2.0",
      originalInvoiceFile: "pdf_testvendor5.pdf",
      tax: 822.19,
      event_name: "VENDOR_5_EVENT_1",
      item_description: "Five Data Validation Application",
      price: 4110.94,
      quantity: 12091,
      service_name: "Five Data Validation Application",
      contract_id: "5",
      unit_price: 0.34,
    };

    const uuid = crypto.randomBytes(3).toString("hex");
    const year = standardisedInvoiceObject.invoice_receipt_date.getFullYear();
    const month = (
      standardisedInvoiceObject.invoice_receipt_date.getMonth() + 1
    ).toLocaleString("en-US", {
      minimumIntegerDigits: 2,
    });

    const s3Object: S3Object = {
      bucket: `${resourcePrefix()}-storage`,
      key: `btm_invoice_data/${year}/${month}/${year}-${month}-vendor_testvendor5-VENDOR_5_EVENT_1-${uuid}.txt`,
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
        return result?.includes("£4,110.94") ?? false;
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
    expect(response[0].vendor_id).toEqual(standardisedInvoiceObject.vendor_id);
    expect(response[0].vendor_name).toEqual(
      standardisedInvoiceObject.vendor_name
    );
    expect(response[0].service_name).toEqual(
      standardisedInvoiceObject.service_name
    );
    expect(response[0].contract_id).toEqual(
      standardisedInvoiceObject.contract_id
    );
    expect(response[0].contract_name).toEqual(
      ContractName.vendor_testvendor5_contract1
    );
    expect(response[0].year).toEqual(year.toString());
    expect(response[0].month).toEqual(month.toString());
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
  });
});

interface BtmMonthlyExtract {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  contract_id: string;
  contract_name: string;
  year: string;
  month: string;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference: string;
  billing_quantity: string;
  transaction_quantity: string;
  quantity_difference: string;
  billing_amount_with_tax: string;
  price_difference_percentage: number;
}
