import fs from "node:fs";
import path from "node:path";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  checkIfS3ObjectExists,
  putS3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  Invoice,
  makeMockInvoicePdfData,
  randomInvoiceData,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice";

const prefix = resourcePrefix();
const givenVendorId = "vendor123";

describe("Email", () => {
  test("CSV attachment", async () => {
    const givenCsvName = `email-test-raw-invoice-validFile-${makeUniqueString()}.csv`;
    const givenEmail = makeEmailWithAttachments([
      {
        data: "test CSV data",
        name: givenCsvName,
      },
    ]);

    await putS3Object({
      data: givenEmail,
      target: {
        bucket: `${prefix}-email`,
        key: `${givenVendorId}/${makeUniqueString()}`,
      },
    });

    const csvIsInRawInvoiceBucket = await waitForRawInvoice(
      givenVendorId,
      givenCsvName
    );
    expect(csvIsInRawInvoiceBucket).toBe(true);
  });

  it("PDF attachment", async () => {
    const givenPdfName = `email-test-raw-invoice-validFile-${makeUniqueString()}.pdf`;
    const email = makeEmailWithAttachments([
      {
        data: makeRandomInvoicePdfData(),
        name: givenPdfName,
      },
    ]);

    await putS3Object({
      data: email,
      target: {
        bucket: `${prefix}-email`,
        key: `${givenVendorId}/${makeUniqueString()}`,
      },
    });

    const pdfIsInRawInvoiceBucket = await waitForRawInvoice(
      givenVendorId,
      givenPdfName
    );
    expect(pdfIsInRawInvoiceBucket).toBe(true);
  });

  it("CSV and PDF", async () => {
    const givenCsvName = `email-test-raw-invoice-validFile-${makeUniqueString()}.csv`;
    const givenPdfName = `email-test-raw-invoice-validFile-${makeUniqueString()}.pdf`;
    const email = makeEmailWithAttachments([
      {
        data: "test CSV data",
        name: givenCsvName,
      },
      {
        data: makeRandomInvoicePdfData(),
        name: givenPdfName,
      },
    ]);

    await putS3Object({
      data: email,
      target: {
        bucket: `${prefix}-email`,
        key: `${givenVendorId}/${makeUniqueString()}`,
      },
    });

    const [csvIsInRawInvoiceBucket, pdfIsInRawInvoiceBucket] =
      await Promise.all([
        waitForRawInvoice(givenVendorId, givenCsvName),
        waitForRawInvoice(givenVendorId, givenPdfName),
      ]);
    expect(csvIsInRawInvoiceBucket).toBe(true);
    expect(pdfIsInRawInvoiceBucket).toBe(true);
  });

  it("CSV, PDF and JPEG", async () => {
    const givenCsvName = `email-test-raw-invoice-validFile-${makeUniqueString()}.csv`;
    const givenJpegName = `email-test-raw-invoice-validFile-${makeUniqueString()}.jpeg`;
    const givenPdfName = `email-test-raw-invoice-validFile-${makeUniqueString()}.pdf`;
    const email = makeEmailWithAttachments([
      {
        data: "test CSV data",
        name: givenCsvName,
      },
      {
        data: getPayloadData("test.jpeg"),
        name: givenJpegName,
      },
      {
        data: makeRandomInvoicePdfData(),
        name: givenPdfName,
      },
    ]);

    await putS3Object({
      data: email,
      target: {
        bucket: `${prefix}-email`,
        key: `${givenVendorId}/${makeUniqueString()}`,
      },
    });

    const [
      csvIsInRawInvoiceBucket,
      jpegIsInRawInvoiceBucket,
      pdfIsInRawInvoiceBucket,
    ] = await Promise.all([
      waitForRawInvoice(givenVendorId, givenCsvName),
      waitForRawInvoice(givenVendorId, givenJpegName),
      waitForRawInvoice(givenVendorId, givenPdfName),
    ]);
    expect(csvIsInRawInvoiceBucket).toBe(true);
    expect(jpegIsInRawInvoiceBucket).toBe(true);
    expect(pdfIsInRawInvoiceBucket).toBe(true);
  });

  it("Various attachments", async () => {
    const givenCsvName1 = `email-test-raw-invoice-validFile-${makeUniqueString()}.csv`;
    const givenCsvName2 = `email-test-raw-invoice-validFile-${makeUniqueString()}.csv`;
    const givenJpegName = `email-test-raw-invoice-validFile-${makeUniqueString()}.jpeg`;
    const givenPdfName1 = `email-test-raw-invoice-validFile-${makeUniqueString()}.pdf`;
    const givenPdfName2 = `email-test-raw-invoice-validFile-${makeUniqueString()}.pdf`;
    const givenPngName = `email-test-raw-invoice-validFile-${makeUniqueString()}.png`;
    const email = makeEmailWithAttachments([
      {
        data: "test CSV data 1",
        name: givenCsvName1,
      },
      {
        data: "test CSV data 2",
        name: givenCsvName2,
      },
      {
        data: getPayloadData("test.jpeg"),
        name: givenJpegName,
      },
      {
        data: makeRandomInvoicePdfData(),
        name: givenPdfName1,
      },
      {
        data: makeRandomInvoicePdfData(),
        name: givenPdfName2,
      },
      {
        data: getPayloadData("test.png"),
        name: givenPngName,
      },
    ]);

    await putS3Object({
      data: email,
      target: {
        bucket: `${prefix}-email`,
        key: `${givenVendorId}/${makeUniqueString()}`,
      },
    });

    const [
      csv1IsInRawInvoiceBucket,
      csv2IsInRawInvoiceBucket,
      jpegIsInRawInvoiceBucket,
      pdf1IsInRawInvoiceBucket,
      pdf2IsInRawInvoiceBucket,
      pngIsInRawInvoiceBucket,
    ] = await Promise.all([
      waitForRawInvoice(givenVendorId, givenCsvName1),
      waitForRawInvoice(givenVendorId, givenCsvName2),
      waitForRawInvoice(givenVendorId, givenJpegName),
      waitForRawInvoice(givenVendorId, givenPdfName1),
      waitForRawInvoice(givenVendorId, givenPdfName2),
      waitForRawInvoice(givenVendorId, givenPngName),
    ]);
    expect(csv1IsInRawInvoiceBucket).toBe(true);
    expect(csv2IsInRawInvoiceBucket).toBe(true);
    expect(jpegIsInRawInvoiceBucket).toBe(true);
    expect(pdf1IsInRawInvoiceBucket).toBe(true);
    expect(pdf2IsInRawInvoiceBucket).toBe(true);
    expect(pngIsInRawInvoiceBucket).toBe(true);
  });
});

type AttachmentOption = {
  data: Buffer | string;
  name: string;
};

const CONTENT_TYPES_BY_FILE_EXTENSION = {
  csv: "text/csv",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
};

const checkForRawInvoice = async (
  vendorId: string,
  fileName: string
): Promise<boolean> =>
  await checkIfS3ObjectExists({
    key: `${vendorId}/${fileName}`,
    bucket: `${prefix}-raw-invoice`,
  });

const getPayloadData = (fileName: string): Buffer => {
  const filePath = path.join(__dirname, "../payloads", fileName);
  return fs.readFileSync(filePath);
};

const makeEmailWithAttachments = (options: AttachmentOption[]): string => {
  const boundary = "0";

  const attachmentStrings = options.map(({ data, name }) => {
    const fileNameParts = name.split(".");
    const fileExtension = fileNameParts[fileNameParts.length - 1];

    if (!(fileExtension in CONTENT_TYPES_BY_FILE_EXTENSION))
      throw Error(`File extension unsupported: ${fileExtension}`);

    const contentType =
      CONTENT_TYPES_BY_FILE_EXTENSION[
        fileExtension as keyof typeof CONTENT_TYPES_BY_FILE_EXTENSION
      ];

    const encodedData = data.toString("base64");
    const encodedLines = encodedData.match(/.{1,77}/g) ?? []; // Split into 77-character lines

    const attachmentLines = [
      `--${boundary}`,
      `Content-Type: ${contentType}`,
      `Content-Disposition: attachment; filename="${name}`,
      "Content-Transfer-Encoding: base64",
      "",
      ...encodedLines,
    ];

    return attachmentLines.join("\n");
  });

  const attachmentsText = attachmentStrings.join("\n");

  return `MIME-Version: 1.0\nContent-Type: multipart/mixed; boundary="${boundary}"\n\n${attachmentsText}\n--${boundary}--`;
};

const makeRandomInvoicePdfData = (): string => {
  const invoiceData = randomInvoiceData();
  const invoice = new Invoice(invoiceData);
  return makeMockInvoicePdfData(invoice);
};

const makeUniqueString = (): string =>
  Math.random().toString(36).substring(2, 7);

const waitForRawInvoice = async (
  vendorId: string,
  fileName: string
): Promise<boolean> =>
  await poll(
    async () => await checkForRawInvoice(vendorId, fileName),
    (resolution) => resolution,
    {
      timeout: 30000,
      notCompleteErrorMessage: `Not found in raw invoice bucket: ${vendorId}/${fileName}`,
    }
  );
