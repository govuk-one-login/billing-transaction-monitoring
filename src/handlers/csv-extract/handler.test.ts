import { SQSEvent } from "aws-lambda";
import {
  fetchS3,
  getFromEnv,
  getVendorServiceConfigRows,
  logger,
  sendRecord,
} from "../../shared/utils";
import { handler } from "./handler";

jest.mock("../../shared/utils", () => {
  const original = jest.requireActual("../../shared/utils");
  return {
    ...original,
    fetchS3: jest.fn(),
    putTextS3: jest.fn(),
    getVendorServiceConfigRows: jest.fn(),
    logger: { error: jest.fn() },
    getStandardisedInvoiceKey: jest.fn(),
    sendRecord: jest.fn(),
    getFromEnv: jest.fn(),
  };
});
const mockedFetchS3 = fetchS3 as jest.Mock;
const mockedGetFromEnv = getFromEnv as jest.Mock;
const mockedGetVendorServiceConfigRows =
  getVendorServiceConfigRows as jest.Mock;
const mockedSendRecord = sendRecord as jest.Mock;

describe("CSV Extract handler tests", () => {
  let mockedEnv: Partial<Record<string, string>>;
  const givenBucketName = "some bucket name";
  const givenFileName = "some file name.csv";
  const givenObjectKey1 = `vendor123/${givenFileName}`;
  const givenOutputQueueUrl = "given output queue URL";

  const validEvent = {
    Records: [
      {
        body: JSON.stringify({
          Records: [
            {
              s3: {
                bucket: {
                  name: givenBucketName,
                },
                object: {
                  key: givenObjectKey1,
                },
              },
            },
          ],
        }),
        messageId: "given message ID",
      },
    ],
  } as unknown as SQSEvent;
  const validInvoiceData =
    "Vendor,Skippy’s Everything Shop,,,,,\n" +
    "Invoice Date,2022/1/1,,,,,\n" +
    "Invoice Period Start,2022/1/1,,,,,\n" +
    "Due Date,2022/2/1,,,,,\n" +
    "VAT Number,123 4567 89,,,,,\n" +
    "PO Number,123 4567 89,,,,,\n" +
    "Version,1.0.0,,,,,\n" +
    ",,,,,,\n" +
    "Service Name,Unit Price,Quantity,Tax,Subtotal,Total,\n" +
    "Horse Hoof Whittling,12.45,28,69.72,348.6,418.32,\n";

  const vendorServiceConfigRows = [
    {
      vendor_name: "Skippy’s Everything Shop",
      vendor_id: "vendor123",
      service_name: "Horse Hoof Whittling",
      service_regex: "Horse Hoof Whittling",
      event_name: "VENDOR_1_EVENT_1",
      contract_id: "1",
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();

    mockedEnv = {
      CONFIG_BUCKET: "given config bucket",
      OUTPUT_QUEUE_URL: givenOutputQueueUrl,
    };

    mockedGetFromEnv.mockImplementation((key) => mockedEnv[key]);
  });

  function expectHandlerFailure(errorMessage: string): void {
    expect(logger.error).toHaveBeenCalledWith(
      "Handler failure",
      expect.objectContaining({
        error: expect.objectContaining({
          message: errorMessage,
        }),
      })
    );
  }

  test("should throw an error if the config bucket is not set", async () => {
    delete mockedEnv.CONFIG_BUCKET;
    await expect(handler(validEvent)).rejects.toThrowError(
      "Config bucket not set."
    );
  });

  test("should throw an error if the output queue URL is not set", async () => {
    delete mockedEnv.OUTPUT_QUEUE_URL;
    await expect(handler(validEvent)).rejects.toThrowError("Output queue URL");
  });

  test("should throw error if event record does not have a JSON serialisable body", async () => {
    const eventWithInvalidRecordBody = {
      Records: [
        {
          body: "{",
          messageId: "given message ID",
        },
      ],
    };

    const result = await handler(eventWithInvalidRecordBody as SQSEvent);

    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
    expectHandlerFailure("Record body not valid JSON.");
    expect(mockedFetchS3).not.toBeCalled();
    expect(mockedGetVendorServiceConfigRows).not.toBeCalled();
  });

  test("should throw error if event record has body that does not serialise to object", async () => {
    const eventWithInvalidRecordBody = {
      Records: [
        {
          body: "1234",
          messageId: "given message ID",
        },
      ],
    };

    const result = await handler(eventWithInvalidRecordBody as SQSEvent);

    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
    expectHandlerFailure("Record body not object.");
    expect(mockedFetchS3).not.toBeCalled();
    expect(mockedGetVendorServiceConfigRows).not.toBeCalled();
  });

  test("should throw error if event record has invalid S3 event record in body", async () => {
    const eventWithInvalidRecordBody = {
      Records: [
        {
          body: JSON.stringify({
            Records: [
              {
                s3: {
                  bucket: {
                    name: "some bucket name",
                  },
                  object: {
                    key: 123412, // Invalid key because it is not a string
                  },
                },
              },
            ],
          }),
          messageId: "given message ID",
        },
      ],
    };

    const result = await handler(eventWithInvalidRecordBody as SQSEvent);

    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
    expectHandlerFailure("Event record body not valid S3 event.");
    expect(mockedFetchS3).not.toBeCalled();
    expect(mockedGetVendorServiceConfigRows).not.toBeCalled();
  });

  test("should throw error with event record that has a valid S3 event in body with no vendor ID folder", async () => {
    const givenEventWithNoFolder = {
      Records: [
        {
          body: JSON.stringify({
            Records: [
              {
                s3: {
                  bucket: {
                    name: "given bucket name",
                  },
                  object: {
                    key: "given-file-path-with-no-folder",
                  },
                },
              },
            ],
          }),
          messageId: "given message ID",
        },
      ],
    };

    const result = await handler(givenEventWithNoFolder as SQSEvent);

    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
    expectHandlerFailure(
      "File not in vendor ID folder: given bucket name/given-file-path-with-no-folder"
    );
    expect(mockedFetchS3).not.toBeCalled();
    expect(mockedGetVendorServiceConfigRows).not.toBeCalled();
  });

  test("should throw error when given a valid bucket and key but fetchS3 throws error when fetching invoice", async () => {
    const mockedErrorText = "mocked fetchS3 error";
    const mockedError = new Error(mockedErrorText);
    mockedFetchS3.mockRejectedValue(mockedError);

    const result = await handler(validEvent);
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
    expectHandlerFailure(mockedErrorText);
    expect(mockedFetchS3).toBeCalled();
    expect(mockedGetVendorServiceConfigRows).not.toBeCalled();
  });

  test("should throw error when given a valid bucket and key but fetching vendor config throws an error", async () => {
    const mockedErrorText = "mocked getVendorServiceConfigRows error";
    const mockedError = new Error(mockedErrorText);
    mockedFetchS3.mockResolvedValue(validInvoiceData);
    mockedGetVendorServiceConfigRows.mockRejectedValueOnce(mockedError);

    const result = await handler(validEvent);
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
    expectHandlerFailure(mockedErrorText);
    expect(mockedFetchS3).toBeCalled();
    expect(mockedGetVendorServiceConfigRows).toBeCalled();
  });

  test("should throw error if given an invalid csv", async () => {
    const invalidInvoiceData =
      // Test the case with 'Vendor' misspelled
      "Vender,Skippy’s Everything Shop,,,,,\n" +
      "Invoice Date,2022/1/1,,,,,\n" +
      "Invoice Period Start,2022/1/1,,,,,\n" +
      "Due Date,2022/2/1,,,,,\n" +
      "VAT Number,123 4567 89,,,,,\n" +
      "PO Number,123 4567 89,,,,,\n" +
      "Version,1.0.0,,,,,\n" +
      ",,,,,,\n" +
      "Service Name,Unit Price,Quantity,Tax,Subtotal,Total,\n" +
      "Horse Hoof Whittling,12.45,28,69.72,348.6,418.32,\n";
    mockedFetchS3.mockReturnValueOnce(invalidInvoiceData);

    const result = await handler(validEvent);
    expect(mockedGetVendorServiceConfigRows).not.toBeCalled();
    expect(result).toEqual({
      batchItemFailures: [
        {
          itemIdentifier: "given message ID",
        },
      ],
    });
    expectHandlerFailure("Csv is invalid.");
  });

  test("should throw error if getCsvStandardisedInvoice doesn't return any line items", async () => {
    mockedFetchS3.mockReturnValueOnce(validInvoiceData);
    mockedGetVendorServiceConfigRows.mockResolvedValueOnce([
      {
        vendor_name: "Skippy’s Everything Shop",
        vendor_id: "vendor123",
        service_name: "Horse Hoof Whittling",
        service_regex: "Non matching regex",
        event_name: "VENDOR_1_EVENT_1",
        contract_id: "1",
      },
    ]);

    const result = await handler(validEvent);
    expect(result).toEqual({
      batchItemFailures: [
        {
          itemIdentifier: "given message ID",
        },
      ],
    });
    expectHandlerFailure("No matching line items in csv invoice.");
  });

  test("should throw error with sendRecord sending failure", async () => {
    mockedFetchS3.mockReturnValueOnce(validInvoiceData);
    mockedGetVendorServiceConfigRows.mockResolvedValue(vendorServiceConfigRows);
    const mockedErrorText = "mocked send error";
    const mockedError = new Error(mockedErrorText);
    mockedSendRecord.mockRejectedValue(mockedError);

    const result = await handler(validEvent);
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
    expectHandlerFailure(mockedErrorText);
  });

  test("should store the standardised invoice if no errors", async () => {
    mockedFetchS3.mockReturnValueOnce(validInvoiceData);
    mockedGetVendorServiceConfigRows.mockResolvedValue(vendorServiceConfigRows);
    const result = await handler(validEvent);
    expect(result).toEqual({ batchItemFailures: [] });
    expect(mockedSendRecord).toHaveBeenCalledTimes(1);
    expect(mockedSendRecord).toHaveBeenCalledWith(
      givenOutputQueueUrl,
      JSON.stringify({
        invoice_receipt_id: "123 4567 89",
        vendor_id: "vendor123",
        vendor_name: "Skippy’s Everything Shop",
        invoice_receipt_date: "2022-01-01",
        invoice_period_start: "2022-01-01",
        due_date: "2022-02-01",
        tax_payer_id: "123 4567 89",
        parser_version: "1.0.0",
        originalInvoiceFile: givenFileName,
        event_name: "VENDOR_1_EVENT_1",
        item_description: "Horse Hoof Whittling",
        subtotal: 348.6,
        price: 348.6,
        quantity: 28,
        service_name: "Horse Hoof Whittling",
        contract_id: "1",
        unit_price: 12.45,
        tax: 69.72,
        total: 418.32,
      })
    );
  });

  test("should store the standardised invoice if no errors and no trailing commas table", async () => {
    const validInvoiceData =
      "Vendor,Skippy’s Everything Shop,,,,,\n" +
      "Invoice Period Start,2022/1/1,,,,,\n" +
      "Invoice Date,2022/1/1,,,,,\n" +
      "Invoice Period Start,2022/1/1,,,,,\n" +
      "Due Date,2022/2/1,,,,,\n" +
      "VAT Number,123 4567 89,,,,,\n" +
      "PO Number,123 4567 89,,,,,\n" +
      "Version,1.0.0,,,,,\n" +
      ",,,,,,\n" +
      "Service Name,Unit Price,Quantity,Tax,Subtotal,Total\n" +
      "Horse Hoof Whittling,12.45,28,69.72,348.6,418.32\n";
    mockedFetchS3.mockReturnValueOnce(validInvoiceData);
    mockedGetVendorServiceConfigRows.mockResolvedValue(vendorServiceConfigRows);
    const result = await handler(validEvent);
    expect(result).toEqual({ batchItemFailures: [] });
    expect(mockedSendRecord).toHaveBeenCalledTimes(1);
    expect(mockedSendRecord).toHaveBeenCalledWith(
      givenOutputQueueUrl,
      JSON.stringify({
        invoice_receipt_id: "123 4567 89",
        vendor_id: "vendor123",
        vendor_name: "Skippy’s Everything Shop",
        invoice_receipt_date: "2022-01-01",
        invoice_period_start: "2022-01-01",
        due_date: "2022-02-01",
        tax_payer_id: "123 4567 89",
        parser_version: "1.0.0",
        originalInvoiceFile: givenFileName,
        event_name: "VENDOR_1_EVENT_1",
        item_description: "Horse Hoof Whittling",
        subtotal: 348.6,
        price: 348.6,
        quantity: 28,
        service_name: "Horse Hoof Whittling",
        contract_id: "1",
        unit_price: 12.45,
        tax: 69.72,
        total: 418.32,
      })
    );
  });
});
