import { SQSEvent } from "aws-lambda";
import {
  createEvent,
  createEventRecordWithS3Body,
} from "../../../test-helpers/SQS";
import { handler } from "./handler";
import { logger } from "../../shared/utils";

jest.mock("../../shared/utils", () => {
  const original = jest.requireActual("../../shared/utils");
  return {
    ...original,
    logger: { error: jest.fn() },
  };
});

describe("Process Email Handler test", () => {
  const OLD_ENV = process.env;

  const givenVendorIdFolder = "vendor123";

  const validEvent = createEvent([
    createEventRecordWithS3Body(
      "di-btm-anybucket",
      `${givenVendorIdFolder}/firstEmail.eml`,
      "message ID 1"
    ),
    createEventRecordWithS3Body(
      "di-btm-anybucket",
      `${givenVendorIdFolder}/secondEmail.eml`,
      "message ID 2"
    ),
  ]);

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    process.env.DESTINATION_BUCKET = "Destination bucket";
  });

  afterAll(() => {
    process.env = OLD_ENV;
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

  test("should throw an error if the destination bucket is not set", async () => {
    delete process.env.DESTINATION_BUCKET;
    await expect(handler(validEvent)).rejects.toThrowError(
      "Destination bucket not set."
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
    expectHandlerFailure("Record body not valid JSON.");
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
  });
});
