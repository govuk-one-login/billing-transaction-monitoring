import * as AWS from "aws-sdk";
import {
  createEvent,
  createEventRecordWithBody,
} from "../../../test-helpers/SQS";
import { handler } from "./handler";

jest.mock("aws-sdk");
const MockTextract = AWS.Textract as jest.MockedClass<typeof AWS.Textract>;

describe("Extract handler test", () => {
  const OLD_ENV = process.env;
  const oldConsoleLog = console.log;

  let mockStartExpenseAnalysis: jest.Mock;

  const validEvent = createEvent([
    createEventRecordWithBody("di-btm-anybucket", "onepdf.pdf", "message ID 1"),
    createEventRecordWithBody(
      "di-btm-anybucket",
      "secondpdf.pdf",
      "message ID 2"
    ),
  ]);

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    process.env.TEXT_EXTRACT_ROLE = "Text extract role";
    process.env.SNS_TOPIC = "Textract Raw Invoice Data Topic";
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

  test("Extract handler with valid event record that has S3 data returns a JobId", async () => {
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
        RoleArn: process.env.TEXT_EXTRACT_ROLE,
        SNSTopicArn: process.env.SNS_TOPIC,
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
        RoleArn: process.env.TEXT_EXTRACT_ROLE,
        SNSTopicArn: process.env.SNS_TOPIC,
      },
    });
    expect(response.JobId[0].JobId).toEqual("Some job ID");
    expect(response.JobId[1].JobId).toEqual("Another job ID");
    expect(response.JobId?.length).toBe(2);
  });

  test("Extract handler with valid event record that doesnt have a textract role throws an error", async () => {
    process.env.TEXT_EXTRACT_ROLE = undefined;
    try {
      await handler(validEvent);
    } catch (e: any) {
      expect(e.message).toEqual("Textract role not set.");
    }
  });

  test("Extract handler with valid event record that doesnt have an sns topic throws an error", async () => {
    process.env.SNS_TOPIC = undefined;
    try {
      await handler(validEvent);
    } catch (e: any) {
      expect(e.message).toEqual("SNS Topic not set.");
    }
  });
});
