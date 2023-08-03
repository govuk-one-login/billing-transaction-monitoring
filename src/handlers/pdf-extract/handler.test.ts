import { SQSEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import {
  createEvent,
  createEventRecordWithS3Body,
} from "../../../test-helpers/SQS";
import { getFromEnv } from "../../shared/utils/env";
import { handler } from "./handler";

jest.mock("aws-sdk");
const MockTextract = AWS.Textract as jest.MockedClass<typeof AWS.Textract>;

jest.mock("../../shared/utils/env");
const mockedGetFromEnv = getFromEnv as jest.Mock;

jest.mock("../../shared/utils/logger");

describe("Pdf Extract handler test", () => {
  let mockedEnv: Partial<Record<string, string>>;
  let mockStartExpenseAnalysis: jest.Mock;

  const givenVendorIdFolder = "vendor123";

  const validEvent = createEvent([
    createEventRecordWithS3Body(
      "di-btm-anybucket",
      `${givenVendorIdFolder}/onepdf.pdf`,
      "message ID 1"
    ),
    createEventRecordWithS3Body(
      "di-btm-anybucket",
      `${givenVendorIdFolder}/secondpdf.pdf`,
      "message ID 2"
    ),
  ]);

  beforeEach(() => {
    mockedEnv = {};
    mockedEnv.TEXTRACT_ROLE = "Text extract role";
    mockedEnv.TEXTRACT_SNS_TOPIC = "Textract Raw Invoice Data Topic";

    mockedGetFromEnv.mockImplementation((key) => mockedEnv[key]);

    mockStartExpenseAnalysis = jest.fn(() => ({
      promise: jest.fn().mockResolvedValue({ JobId: "Another job ID" }),
    }));
    MockTextract.mockReturnValue({
      startExpenseAnalysis: mockStartExpenseAnalysis,
    } as any);
  });

  test("Extract handler with valid event record calls textract function startExpenseAnalysis", async () => {
    mockStartExpenseAnalysis.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({ JobId: "Some job ID" }),
    });

    const response = await handler(validEvent);

    expect(mockStartExpenseAnalysis).toHaveBeenCalledTimes(2);
    expect(mockStartExpenseAnalysis).toHaveBeenCalledWith({
      DocumentLocation: {
        S3Object: {
          Bucket: "di-btm-anybucket",
          Name: `${givenVendorIdFolder}/onepdf.pdf`,
        },
      },
      NotificationChannel: {
        RoleArn: mockedEnv.TEXTRACT_ROLE,
        SNSTopicArn: mockedEnv.TEXTRACT_SNS_TOPIC,
      },
    });
    expect(mockStartExpenseAnalysis).toHaveBeenCalledWith({
      DocumentLocation: {
        S3Object: {
          Bucket: "di-btm-anybucket",
          Name: `${givenVendorIdFolder}/secondpdf.pdf`,
        },
      },
      NotificationChannel: {
        RoleArn: mockedEnv.TEXTRACT_ROLE,
        SNSTopicArn: mockedEnv.TEXTRACT_SNS_TOPIC,
      },
    });
    expect(response.batchItemFailures).toHaveLength(0);
  });

  test("Extract handler with valid event record that doesnt have a textract role throws an error", async () => {
    mockedEnv.TEXTRACT_ROLE = undefined;
    let resultError;
    try {
      await handler(validEvent);
    } catch (e: any) {
      resultError = e;
    }
    expect(resultError).toBeInstanceOf(Error);
    expect(resultError.message).toEqual("Textract role not set.");
  });

  test("Extract handler with valid event record that doesnt have an sns topic throws an error", async () => {
    mockedEnv.TEXTRACT_SNS_TOPIC = undefined;
    let resultError;
    try {
      await handler(validEvent);
    } catch (e: any) {
      resultError = e;
    }
    expect(resultError).toBeInstanceOf(Error);
    expect(resultError.message).toEqual("SNS Topic not set.");
  });

  test("Extract handler with empty event does not call textract", async () => {
    const event = createEvent([]);
    await handler(event);
    expect(mockStartExpenseAnalysis).not.toHaveBeenCalled();
  });

  test("Extract handler with an undefined JobId throws error", async () => {
    mockStartExpenseAnalysis
      .mockReturnValue({
        promise: jest.fn().mockResolvedValue({ JobId: undefined }),
      })
      .mockReturnValueOnce({
        promise: jest.fn().mockResolvedValue({ JobId: "Some job ID" }),
      });

    const response = await handler(validEvent);

    expect(mockStartExpenseAnalysis).toHaveBeenCalledTimes(2);
    expect(response.batchItemFailures).toHaveLength(1);
    expect(response.batchItemFailures[0].itemIdentifier).toEqual(
      "message ID 2"
    );
  });

  test("Extract handler with event record that does not have a JSON serialisable body", async () => {
    const givenEvent = {
      Records: [
        {
          body: "{",
          messageId: "given message ID",
        },
      ],
    };

    const result = await handler(givenEvent as SQSEvent);

    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
  });

  test("Extract handler with event record that has body that does not serialise to object", async () => {
    const givenEvent = {
      Records: [
        {
          body: "1234",
          messageId: "given message ID",
        },
      ],
    };

    const result = await handler(givenEvent as SQSEvent);

    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
  });

  test("Extract handler with event record that has invalid S3 event in body", async () => {
    const givenEvent = {
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

    const result = await handler(givenEvent as SQSEvent);

    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
  });

  test("Extract handler with event record that has valid S3 event in body with no records", async () => {
    const givenEvent = {
      Records: [
        {
          body: JSON.stringify({
            Records: [],
          }),
        },
      ],
    };

    const result = await handler(givenEvent as SQSEvent);

    expect(mockStartExpenseAnalysis).not.toHaveBeenCalled();
    expect(result).toEqual({ batchItemFailures: [] });
  });

  test("Extract handler with single event record that has valid S3 event in body with multiple records", async () => {
    const givenBucketName = "some bucket name";
    const givenObjectKey1 = `${givenVendorIdFolder}/some object key`;
    const givenObjectKey2 = `${givenVendorIdFolder}/some other object key`;
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
              {
                s3: {
                  bucket: {
                    name: givenBucketName,
                  },
                  object: {
                    key: givenObjectKey2,
                  },
                },
              },
            ],
          }),
        },
      ],
    };

    const result = await handler(givenEvent as SQSEvent);

    expect(result).toEqual({ batchItemFailures: [] });
    expect(mockStartExpenseAnalysis).toHaveBeenCalledTimes(2);
    expect(mockStartExpenseAnalysis).toHaveBeenCalledWith({
      DocumentLocation: {
        S3Object: {
          Bucket: givenBucketName,
          Name: givenObjectKey1,
        },
      },
      NotificationChannel: {
        RoleArn: mockedEnv.TEXTRACT_ROLE,
        SNSTopicArn: mockedEnv.TEXTRACT_SNS_TOPIC,
      },
    });
    expect(mockStartExpenseAnalysis).toHaveBeenCalledWith({
      DocumentLocation: {
        S3Object: {
          Bucket: givenBucketName,
          Name: givenObjectKey2,
        },
      },
      NotificationChannel: {
        RoleArn: mockedEnv.TEXTRACT_ROLE,
        SNSTopicArn: mockedEnv.TEXTRACT_SNS_TOPIC,
      },
    });
  });

  test("Extract handler with event record that has valid S3 event in body with no vendor ID folder", async () => {
    const givenEvent = {
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

    const result = await handler(givenEvent as SQSEvent);

    expect(result).toEqual({
      batchItemFailures: [{ itemIdentifier: "given message ID" }],
    });
  });
});
