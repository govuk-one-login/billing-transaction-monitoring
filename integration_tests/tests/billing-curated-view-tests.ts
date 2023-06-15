import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";
import {
  S3Object,
  putS3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { BillingCurated } from "./s3-invoice-end-to-end-tests";
import crypto from "crypto";

describe("\n Upload invoice standardised data to s3 directly and check the billing curated view", () => {
  test("Uploaded invoice standardised data should match the results from billing curated view", async () => {
    const standardisedObjects = [
      {
        invoice_receipt_id: "rbl-653950781",
        vendor_id: "vendor_testvendor5",
        vendor_name: "Vendor Five",
        total: 116.1,
        invoice_receipt_date: new Date("2005-11-28"),
        subtotal: 96,
        due_date: "2023-03-14",
        tax_payer_id: "GB72937880",
        parser_version: "default_1.2.0",
        originalInvoiceFile: "invoice1.pdf",
        tax: 20.1,
        event_name: "VENDOR_5_EVENT_1",
        item_description: "Five Data validation Application",
        price: 96,
        quantity: 300,
        service_name: "Five Data validation Application",
        unit_price: 0.32,
      },
      {
        invoice_receipt_id: "xcr-983950712",
        vendor_id: "vendor_testvendor5",
        vendor_name: "Vendor Five",
        total: 180.1,
        invoice_receipt_date: new Date("2005-12-28"),
        subtotal: 160,
        due_date: "2023-04-14",
        tax_payer_id: "GB72937880",
        parser_version: "default_1.2.0",
        originalInvoiceFile: "invoice2.pdf",
        tax: 20.1,
        event_name: "VENDOR_5_EVENT_1",
        item_description: "Five Data validation Application",
        price: 160,
        quantity: 500,
        service_name: "Five Data validation Application",
        unit_price: 0.32,
      },
    ];

    for (const standardisedObject of standardisedObjects) {
      const uuid = crypto.randomBytes(3).toString("hex");
      const year = standardisedObject.invoice_receipt_date.getFullYear();
      const month = (
        standardisedObject.invoice_receipt_date.getMonth() + 1
      ).toLocaleString("en-US", {
        minimumIntegerDigits: 2,
      });

      const s3Object: S3Object = {
        bucket: `${resourcePrefix()}-storage`,
        key: `btm_invoice_data/${year}/${month}/${year}-${month}-vendor_testvendor5-VENDOR_5_EVENT_1-${uuid}.txt`,
      };

      // Upload standardised data to s3
      await putS3Object({
        data: JSON.stringify(standardisedObject),
        target: s3Object,
      });

      // Check the billing_curated_view results match with uploaded standardised object.
      const queryString = `SELECT * FROM "btm_billing_curated" where vendor_id ='${standardisedObject.vendor_id}' AND year='${year}' AND month='${month}'`;
      const response = await queryAthena<BillingCurated>(queryString);
      expect(response.length).toEqual(1);
      expect(response[0].vendor_id).toEqual(standardisedObject.vendor_id);
      expect(response[0].vendor_name).toEqual(standardisedObject.vendor_name);
      expect(response[0].service_name).toEqual(standardisedObject.service_name);
      expect(response[0].event_name).toEqual(standardisedObject.event_name);
      expect(response[0].quantity).toEqual(
        standardisedObject.quantity.toString()
      );
      expect(response[0].price).toEqual(standardisedObject.price.toFixed(4));
      expect(response[0].tax).toEqual(standardisedObject.tax.toFixed(4));
      expect(response[0].year).toEqual(year.toString());
      expect(response[0].month).toEqual(month.toString());
    }
  });
});
