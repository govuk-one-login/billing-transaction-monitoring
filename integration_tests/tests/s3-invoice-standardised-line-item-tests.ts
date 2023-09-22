import {
  E2ETestParserServiceConfig,
  getE2ETestConfig,
} from "../../src/handlers/int-test-support/config-utils/get-e2e-test-config";
import {
  randomInvoiceData,
  randomString,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice";
import {
  checkStandardised,
  createInvoiceInS3,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import { S3Object } from "../../src/handlers/int-test-support/helpers/s3Helper";

describe("New invoice with same month, vendor, service as old line item", () => {
  let givenService1LineItem: S3Object | undefined;

  test("should archive old line item", async () => {
    const givenDate = new Date("2006-02-10");

    // Get vendor that uses default PDF parser
    const {
      parser_default_vendor_id: givenVendorId,
      parser_default_service_1: givenVendorService1,
      parser_default_service_2: givenVendorService2,
    } = await getE2ETestConfig();

    // Upload two invoices with different vendor services
    await Promise.all([
      uploadInvoice(givenDate, givenVendorId, givenVendorService1),
      uploadInvoice(givenDate, givenVendorId, givenVendorService2),
    ]);

    // Check they were standardised
    [givenService1LineItem] = await Promise.all([
      checkStandardised(
        givenDate,
        givenVendorId,
        givenVendorService1,
        "Given service 1 line item"
      ),
      checkStandardised(
        givenDate,
        givenVendorId,
        givenVendorService2,
        "Given service 2 line item"
      ),
    ]);

    // Upload new invoice for existing vendor service
    await uploadInvoice(givenDate, givenVendorId, givenVendorService1);

    // Check it was standardised
    await checkStandardised(
      givenDate,
      givenVendorId,
      givenVendorService1,
      "New service 1 line item",
      { keyToExclude: givenService1LineItem.key }
    );

    // Check old matching line item was archived
    await checkStandardised(
      givenDate,
      givenVendorId,
      givenVendorService1,
      "Archived service 1 line item",
      { archived: true }
    );

    // Check old non-matching line item was not archived
    await checkStandardised(
      givenDate,
      givenVendorId,
      givenVendorService2,
      "Non-archived service 2 line item",
      { archived: false }
    );
  });
});

const uploadInvoice = async (
  date: Date,
  vendorId: string,
  serviceConfig: E2ETestParserServiceConfig
): Promise<S3Object> =>
  await createInvoiceInS3({
    filename: `${randomString(8)}.pdf`,
    invoiceData: randomInvoiceData({
      date,
      lineItemCount: 1,
      lineItemOptions: {
        description: serviceConfig.description,
      },
      vendor: {
        id: vendorId,
      },
    }),
  });
