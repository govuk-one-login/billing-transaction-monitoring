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
import {
  listS3Objects,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";

describe("New invoice with same month, vendor, service as old line item", () => {
  let givenService1LineItem: S3Object;
  test("should archive old line item", async () => {
    const givenDate = getRandomInvoiceDate();

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

const getRandomInteger = (minInteger: number, maxInteger: number): number =>
  minInteger + Math.floor(Math.random() * (maxInteger - minInteger + 1));

const getRandomInvoiceDate = (): Date => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const maxYear = 2049;
  const randomYear = getRandomInteger(currentYear + 1, maxYear);

  const randomMonth = getRandomInteger(1, 12);
  const randomMonthText = String(randomMonth).padStart(2, "0");

  return new Date(`${randomYear}-${randomMonthText}-01`);
};

export const listS3Keys = async (
  bucketName: string,
  prefix: string
): Promise<string[]> => {
  const result = await listS3Objects({ bucketName, prefix });
  const keys = result.map(({ key }) => key);
  return keys.filter((key) => key !== undefined) as string[];
};

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
