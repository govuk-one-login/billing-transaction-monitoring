import {
  E2ETestParserServiceConfig,
  getE2ETestConfig,
} from "../../src/handlers/int-test-support/config-utils/get-e2e-test-config";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  randomInvoice,
  randomString,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice";
import { createInvoiceInS3 } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import {
  deleteS3Object,
  listS3Objects,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";

describe("New invoice with same month, vendor, service as old line item", () => {
  // Data to clean up after test
  let givenService1Invoice: S3Object | undefined;
  let givenService1LineItem: S3Object | undefined;
  let givenService2Invoice: S3Object | undefined;
  let givenService2LineItem: S3Object | undefined;
  let resultNewService1Invoice: S3Object | undefined;
  let resultNewService1LineItem: S3Object | undefined;

  // Reset data between tests
  beforeEach(() => {
    givenService1Invoice = undefined;
    givenService1LineItem = undefined;
    givenService2Invoice = undefined;
    givenService2LineItem = undefined;
    resultNewService1Invoice = undefined;
    resultNewService1LineItem = undefined;
  });

  test("should archive old line item", async () => {
    const givenDate = getRandomInvoiceDate();

    // Get vendor that uses default PDF parser
    const {
      parser_default_vendor_id: givenVendorId,
      parser_default_service_1: givenVendorService1,
      parser_default_service_2: givenVendorService2,
    } = await getE2ETestConfig();

    // Upload two invoices with different vendor services
    [givenService1Invoice, givenService2Invoice] = await Promise.all([
      uploadInvoice(givenDate, givenVendorId, givenVendorService1),
      uploadInvoice(givenDate, givenVendorId, givenVendorService2),
    ]);

    // Check they were standardised
    [givenService1LineItem, givenService2LineItem] = await Promise.all([
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
    resultNewService1Invoice = await uploadInvoice(
      givenDate,
      givenVendorId,
      givenVendorService1
    );

    // Check it was standardised
    resultNewService1LineItem = await checkStandardised(
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

  // Delete any uploaded test files
  afterEach(async () => {
    const possibleInvoices: Array<S3Object | undefined> = [
      givenService1Invoice,
      givenService2Invoice,
      resultNewService1Invoice,
    ];
    const invoices = possibleInvoices.filter(Boolean) as S3Object[];
    const invoicePromises = invoices.map(deleteInvoice);

    const possibleLineItems: Array<S3Object | undefined> = [
      givenService1LineItem,
      givenService2LineItem,
      resultNewService1LineItem,
    ];
    const lineItems = possibleLineItems.filter(Boolean) as S3Object[];
    const lineItemPromises = lineItems.map(deleteLineItem);

    await Promise.all([...invoicePromises, ...lineItemPromises]);
  });
});

const checkStandardised = async (
  date: Date,
  vendorId: string,
  serviceConfig: E2ETestParserServiceConfig,
  itemDescription: string,
  {
    archived = false,
    keyToExclude = undefined,
  }: { archived?: boolean; keyToExclude?: string } = {}
): Promise<S3Object> => {
  const bucket = `${resourcePrefix()}-storage`;

  const prefix = getLineItemPrefix(
    date,
    vendorId,
    serviceConfig.event_name,
    archived
  );

  const s3Response = await poll(
    async () => await listS3Objects({ bucketName: bucket, prefix }),

    ({ Contents }) =>
      Contents !== undefined &&
      Contents.filter(
        (result) => result.Key !== undefined && result.Key !== keyToExclude
      ).length === 1,

    {
      interval: 10000,
      nonCompleteErrorMessage: `${itemDescription} not found`,
      timeout: 120000,
    }
  );

  const result = s3Response.Contents?.[0];
  if (result?.Key === undefined) throw new Error("Empty line item data");
  return { bucket, key: result.Key };
};

const deleteExisting = async (
  bucket: string,
  prefixes: string[]
): Promise<void> => {
  const keyListPromises = prefixes.map(
    async (prefix) => await listS3Keys(bucket, prefix)
  );

  const keyArrays = await Promise.all(keyListPromises);

  const keys = keyArrays.flat();

  const deletionPromises = keys.map(
    async (key) => await deleteS3Object({ bucket, key })
  );

  await Promise.all(deletionPromises);
};

const deleteInvoice = async (pdf: S3Object): Promise<void> => {
  const [folderName, pdfFileName] = pdf.key.split("/");
  const textractFileName = pdfFileName.replace(/\.pdf$/gi, ".json");

  await Promise.all([
    deletePdf(folderName, pdfFileName),
    deleteTextractData(folderName, textractFileName),
  ]);
};

const deleteLineItem = async ({ bucket, key }: S3Object): Promise<void> => {
  const [_, fileName] = key.split("/");
  const keys = [key, `btm_billing_standardised_archived/${fileName}`];
  await deleteExisting(bucket, keys);
};

const deletePdf = async (
  folderName: string,
  fileName: string
): Promise<void> => {
  const bucket = `${resourcePrefix()}-raw-invoice`;

  const keys = [
    `${folderName}/${fileName}`,
    `successful/${fileName}`,
    `failed/${fileName}`,
  ];

  await deleteExisting(bucket, keys);
};

const deleteTextractData = async (
  folderName: string,
  fileName: string
): Promise<void> => {
  const bucket = `${resourcePrefix()}-raw-invoice-textract-data`;
  const key = `${folderName}/${fileName}`;
  await deleteExisting(bucket, [key]);
};

const getLineItemPrefix = (
  date: Date,
  vendorId: string,
  eventName: string,
  archived: boolean
): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const monthText = String(month).padStart(2, "0");
  const filePrefix = `${year}-${monthText}-${vendorId}-${eventName}-`;

  return archived
    ? `btm_billing_standardised_archived/${filePrefix}`
    : `btm_invoice_data/${year}/${monthText}/${filePrefix}`;
};

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
  if (result.Contents === undefined) return [];
  const keys: Array<string | undefined> = result.Contents.map(({ Key }) => Key);
  return keys.filter((key) => key !== undefined) as string[];
};

const uploadInvoice = async (
  date: Date,
  vendorId: string,
  serviceConfig: E2ETestParserServiceConfig
): Promise<S3Object> =>
  await createInvoiceInS3({
    filename: `${randomString(8)}.pdf`,
    invoiceData: randomInvoice({
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
