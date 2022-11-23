import * as AWS from "aws-sdk";
import {
  createEvent,
  createEventRecordWithS3Body,
} from "../../../test-helpers/SQS";
import { handler } from "./handler";

jest.mock("aws-sdk");
const MockTextract = AWS.Textract as jest.MockedClass<typeof AWS.Textract>;

describe("Extract handler test", () => {
  const OLD_ENV = process.env;
  const oldConsoleLog = console.log;

  let mockStartExpenseAnalysis: jest.Mock;

  const validEvent = createEvent([
    createEventRecordWithS3Body(
      "di-btm-anybucket",
      "onepdf.pdf",
      "message ID 1"
    ),
    createEventRecordWithS3Body(
      "di-btm-anybucket",
      "secondpdf.pdf",
      "message ID 2"
    ),
  ]);

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    process.env.TEXTRACT_ROLE = "Text extract role";
    process.env.TEXTRACT_SNS_TOPIC = "Textract Raw Invoice Data Topic";
    mockStartExpenseAnalysis = jest.fn();
    MockTextract.mockReturnValue({
      startExpenseAnalysis: mockStartExpenseAnalysis,
    } as any);
    console.log = jest.fn();
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.log = oldConsoleLog;
  });

  test("Extract handler with valid event record calls textract function startExpenseAnalysis", async () => {
    mockStartExpenseAnalysis
      .mockReturnValue({
        promise: jest.fn().mockResolvedValue({ JobId: "Another job ID" }),
      })
      .mockReturnValueOnce({
        promise: jest.fn().mockResolvedValue({ JobId: "Some job ID" }),
      });

    const response = await handler(validEvent);

    expect(mockStartExpenseAnalysis).toHaveBeenCalledTimes(2);
    expect(mockStartExpenseAnalysis).toHaveBeenCalledWith({
      DocumentLocation: {
        S3Object: {
          Bucket: "di-btm-anybucket",
          Name: "onepdf.pdf",
        },
      },
      NotificationChannel: {
        RoleArn: process.env.TEXTRACT_ROLE,
        SNSTopicArn: process.env.TEXTRACT_SNS_TOPIC,
      },
    });
    expect(mockStartExpenseAnalysis).toHaveBeenCalledWith({
      DocumentLocation: {
        S3Object: {
          Bucket: "di-btm-anybucket",
          Name: "secondpdf.pdf",
        },
      },
      NotificationChannel: {
        RoleArn: process.env.TEXTRACT_ROLE,
        SNSTopicArn: process.env.TEXTRACT_SNS_TOPIC,
      },
    });
    expect(response.batchItemFailures).toHaveLength(0);
  });

  test("Extract handler with valid event record that doesnt have a textract role throws an error", async () => {
    process.env.TEXTRACT_ROLE = undefined;
    try {
      await handler(validEvent);
    } catch (e: any) {
      expect(e.message).toEqual("Textract role not set.");
    }
  });

  test("Extract handler with valid event record that doesnt have an sns topic throws an error", async () => {
    process.env.TEXTRACT_SNS_TOPIC = undefined;
    try {
      await handler(validEvent);
    } catch (e: any) {
      expect(e.message).toEqual("SNS Topic not set.");
    }
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
});
