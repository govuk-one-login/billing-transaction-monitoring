import { SQSEvent } from "aws-lambda";
import { fetchS3 } from "../../shared/utils";
import { handler } from "./handler";

jest.mock("../../shared/utils", () => {
  const original = jest.requireActual("../../shared/utils");
  return {
    ...original,
    fetchS3: jest.fn(),
  };
});

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

  test("should fetch the csv if given a valid S3 event", async () => {
    fetchS3.mockImplementation(() => {
      ("");
    });
    const givenBucketName = "some bucket name";
    const givenObjectKey1 = "vendor123/some object key";

    const givenEvent = {
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

    const result = await handler(givenEvent as SQSEvent);
    expect(result).toEqual({ batchItemFailures: [] });
    expect(mockedFetchS3).toHaveBeenCalledTimes(1);
    expect(mockedFetchS3).toHaveBeenCalledWith({
      bucket: givenBucketName,
      key: givenObjectKey1,
    });
  });
});
