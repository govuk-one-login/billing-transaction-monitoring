import { SQSEvent } from "aws-lambda";
import { handler } from "./handler";

describe("CSV Extract handler tests", () => {
  const OLD_ENV = process.env;
  const oldConsoleError = console.error;
  let givenEvent: SQSEvent;

  beforeEach(() => {
    jest.resetAllMocks();

    console.error = jest.fn();

    process.env = {
      ...OLD_ENV,
      DESTINATION_BUCKET: "given destination bucket",
      DESTINATION_FOLDER: "given destination folder",
    };

    givenEvent = { Records: [] };
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
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

  //   test("Store Standardised Invoices handler with two failing records", async () => {
  //     mockedStoreStandardisedInvoices.mockRejectedValue(undefined);

  //     const givenRecord1 = {
  //       messageId: "given record 1 message ID",
  //     } as unknown as SQSRecord;
  //     const givenRecord2 = {
  //       messageId: "given record 2 message ID",
  //     } as unknown as SQSRecord;
  //     givenEvent.Records.push(givenRecord1, givenRecord2);

  //     const result = await handler(givenEvent);

  //     expect(mockedStoreStandardisedInvoices).toHaveBeenCalledTimes(2);
  //     expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
  //       givenRecord1,
  //       process.env.DESTINATION_BUCKET,
  //       process.env.DESTINATION_FOLDER,
  //       process.env.CONFIG_BUCKET
  //     );
  //     expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
  //       givenRecord2,
  //       process.env.DESTINATION_BUCKET,
  //       process.env.DESTINATION_FOLDER,
  //       process.env.CONFIG_BUCKET
  //     );
  //     expect(result).toEqual({
  //       batchItemFailures: [
  //         { itemIdentifier: "given record 1 message ID" },
  //         { itemIdentifier: "given record 2 message ID" },
  //       ],
  //     });
  //   });

  //   test("Store Standardised Invoices handler with one failing and one passing record", async () => {
  //     mockedStoreStandardisedInvoices.mockRejectedValueOnce(undefined);

  //     const givenRecord1 = {
  //       messageId: "given record 1 message ID",
  //     } as unknown as SQSRecord;
  //     const givenRecord2 = {
  //       messageId: "given record 2 message ID",
  //     } as unknown as SQSRecord;
  //     givenEvent.Records.push(givenRecord1, givenRecord2);

  //     const result = await handler(givenEvent);

  //     expect(mockedStoreStandardisedInvoices).toHaveBeenCalledTimes(2);
  //     expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
  //       givenRecord1,
  //       process.env.DESTINATION_BUCKET,
  //       process.env.DESTINATION_FOLDER,
  //       process.env.CONFIG_BUCKET
  //     );
  //     expect(mockedStoreStandardisedInvoices).toHaveBeenCalledWith(
  //       givenRecord2,
  //       process.env.DESTINATION_BUCKET,
  //       process.env.DESTINATION_FOLDER,
  //       process.env.CONFIG_BUCKET
  //     );
  //     expect(result).toEqual({
  //       batchItemFailures: [{ itemIdentifier: "given record 1 message ID" }],
  //     });
  //   });
});
