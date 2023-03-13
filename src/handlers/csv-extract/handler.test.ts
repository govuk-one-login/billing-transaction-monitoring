import { SQSEvent } from "aws-lambda";
import { fetchS3, putTextS3 } from "../../shared/utils";
import { handler } from "./handler";

jest.mock("../../shared/utils", () => {
  const original = jest.requireActual("../../shared/utils");
  return {
    ...original,
    getCsvStandardisedInvoice: jest.fn(),
  };
});
jest.mock("../../shared/utils/s3", () => {
  const original = jest.requireActual("../../shared/utils/s3");
  return {
    ...original,
    fetchS3: jest.fn(),
    putTextS3: jest.fn(),
  };
});
const mockedFetchS3 = fetchS3 as jest.Mock;
const mockedPutTextS3 = putTextS3 as jest.Mock;

describe("CSV Extract handler tests", () => {
  const OLD_ENV = process.env;
  const oldConsoleError = console.error;
  let givenEvent: SQSEvent;
  const givenBucketName = "some bucket name";
  const givenObjectKey1 = "vendor123/some object key";
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
  };
  const validInvoiceData =
    "Vendor,Skippy’s Everything Shop,,,,,\n" +
    "Invoice Date,2022/1/1,,,,,\n" +
    "Due Date,2022/2/1,,,,,\n" +
    "VAT Number,123 4567 89,,,,,\n" +
    "PO Number,123 4567 89,,,,,\n" +
    "Version,1.0.0,,,,,\n" +
    ",,,,,,\n" +
    "Service Name,Unit Price,Quantity,Tax,Subtotal,Total,\n" +
    "Horse Hoof Whittling,12.45,28,69.72,348.6,418.32,\n";
  const validVendorServiceData =
    "vendor_name,vendor_id,service_name,service_regex,event_name\n" +
    "Billy Mitchell LLC,vendor123,Lying About Speedruns,Whittling,donkey_kong\n" +
    "Nito's Bone Zone,vendor_nito,Sword dances,sword dance,sword_dance";

  beforeEach(() => {
    jest.resetAllMocks();

    console.error = jest.fn();

    process.env = {
      ...OLD_ENV,
      CONFIG_BUCKET: "given config bucket",
      DESTINATION_BUCKET: "given destination bucket",
      DESTINATION_FOLDER: "given destination folder",
    };

    givenEvent = { Records: [] };
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
  });

  test("should throw an error if the config bucket is not set", async () => {
    delete process.env.CONFIG_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Config bucket not set."
    );
  });

  test("should throw an error if the destination bucket is not set", async () => {
    delete process.env.DESTINATION_BUCKET;
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Destination bucket"
    );
  });

  test("should throw an error if the destination folder is not set", async () => {
    delete process.env.DESTINATION_FOLDER;
    await expect(handler(givenEvent)).rejects.toThrowError(
      "Destination folder"
    );
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
  });

  test("should throw error if event record has invalid S3 event in body", async () => {
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
  });

  test("should throw error when valid bucket and key but fetchS3 throws error when fetching invoice", async () => {
    const givenEvent = validEvent;
    const invoiceData = validInvoiceData;
    const mockedErrorText = "mocked error";
    const mockedError = new Error(mockedErrorText);
    mockedFetchS3
      .mockReturnValueOnce(invoiceData)
      .mockRejectedValue(mockedError);

    const result = await handler(givenEvent as SQSEvent);
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
  });

  test("should throw error when valid bucket and key but fetchS3 throws error when fetching vendor config", async () => {
    const givenEvent = validEvent;

    const mockedErrorText = "mocked error";
    const mockedError = new Error(mockedErrorText);
    mockedFetchS3.mockRejectedValue(mockedError);

    const result = await handler(givenEvent as SQSEvent);
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
  });

  test("should throw error if given a valid S3 event and an invalid csv", async () => {
    const givenEvent = validEvent;

    const invalidInvoiceData =
      // Test the case with 'Vendor' misspelled
      "Vender,Skippy’s Everything Shop,,,,,\n" +
      "Invoice Date,2022/1/1,,,,,\n" +
      "Due Date,2022/2/1,,,,,\n" +
      "VAT Number,123 4567 89,,,,,\n" +
      "PO Number,123 4567 89,,,,,\n" +
      "Version,1.0.0,,,,,\n" +
      ",,,,,,\n" +
      "Service Name,Unit Price,Quantity,Tax,Subtotal,Total,\n" +
      "Horse Hoof Whittling,12.45,28,69.72,348.6,418.32,\n";
    mockedFetchS3.mockReturnValueOnce(invalidInvoiceData);

    const result = await handler(givenEvent as SQSEvent);
    expect(result).toEqual({
      batchItemFailures: [
        {
          itemIdentifier: "given message ID",
        },
      ],
    });
  });

  test("should throw error with s3 storing failure", async () => {
    const givenEvent = validEvent;
    mockedFetchS3
      .mockReturnValueOnce(validInvoiceData)
      .mockReturnValue(validVendorServiceData);
    const mockedErrorText = "mocked put text error";
    const mockedError = new Error(mockedErrorText);
    mockedPutTextS3.mockRejectedValue(mockedError);

    const result = await handler(givenEvent as SQSEvent);
    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
  });

  test("should store the standardised invoice if no errors", async () => {
    const givenEvent = validEvent;
    mockedFetchS3
      .mockReset()
      .mockReturnValueOnce(validInvoiceData)
      .mockReturnValue(validVendorServiceData);

    const result = await handler(givenEvent as SQSEvent);
    expect(result).toEqual({ batchItemFailures: [] });
    expect(mockedFetchS3).toHaveBeenCalledTimes(2);
    expect(mockedFetchS3).toHaveBeenCalledWith(
      givenBucketName,
      givenObjectKey1
    );
    expect(mockedFetchS3).toHaveBeenCalledWith(
      "given config bucket",
      "vendor_services/vendor-services.csv"
    );
    expect(mockedPutTextS3).toHaveBeenCalledTimes(1);
    expect(mockedPutTextS3).toHaveBeenCalledWith(
      "given destination bucket",
      "given destination folder/some object key",
      JSON.stringify({
        invoice_receipt_id: "123 4567 89",
        vendor_id: "vendor123",
        vendor_name: "Skippy’s Everything Shop",
        invoice_receipt_date: "2022-01-01",
        due_date: "2022-02-01",
        tax_payer_id: "123 4567 89",
        parser_version: "1.0.0",
        item_description: "Horse Hoof Whittling",
        subtotal: 348.6,
        quantity: 28,
        service_name: "Lying About Speedruns",
        unit_price: 12.45,
        total: 418.32,
      })
    );
  });
});
