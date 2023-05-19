import { Logger } from "@aws-lambda-powertools/logger";
import { SQSEvent, S3Event } from "aws-lambda";
import { fetchS3 } from "../shared/utils";
import { makeIncomingMessages } from "./make-incoming-messages";

jest.mock("../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("makeIncomingMessages", () => {
  let mockedS3FileText: string;
  let testEvent: S3Event | SQSEvent;
  let testFailuresAllowed: boolean | undefined;
  let testIncomingMessageBodyTypeGuard: jest.Mock;
  let testLogger: jest.MockedObject<Logger>;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedS3FileText = "test document";
    mockedFetchS3.mockReturnValue(mockedS3FileText);

    testFailuresAllowed = undefined;
    testIncomingMessageBodyTypeGuard = jest.fn(() => true);
    testLogger = { error: jest.fn() } as any;
  });

  describe("Incoming SQS event", () => {
    beforeEach(() => {
      testEvent = {
        Records: [
          {
            messageId: "msg_1",
            body: '{"a":"something","b":12,"c":false}',
          },
        ],
      } as unknown as SQSEvent;
    });

    it("builds SQS messages", async () => {
      const result = await makeIncomingMessages(
        testEvent,
        testIncomingMessageBodyTypeGuard as any,
        testLogger,
        testFailuresAllowed
      );

      expect(result).toEqual({
        incomingMessages: [
          {
            id: "msg_1",
            body: {
              a: "something",
              b: 12,
              c: false,
            },
          },
        ],
        failedIds: [],
      });
    });

    it("builds an S3 messages if the SQS Message contains S3 information", async () => {
      const testSQSEventWithS3 = {
        Records: [
          {
            messageId: "msg_1",
            body: '{"Records":[{"s3":{"bucket":{"name":"some-email-bucket"},"object":{"key":"vendor/Email+with+csv.eml"}}}]}',
          },
        ],
      } as unknown as SQSEvent;
      const result = await makeIncomingMessages(
        testSQSEventWithS3,
        testIncomingMessageBodyTypeGuard as any,
        testLogger,
        testFailuresAllowed
      );

      expect(result).toEqual({
        incomingMessages: [
          {
            body: mockedS3FileText,
            meta: {
              bucketName: "some-email-bucket",
              key: "vendor/Email+with+csv.eml",
            },
          },
        ],
        failedIds: [],
      });
    });

    it("Throws an error by default if a given message does not conform to the specified type", async () => {
      testIncomingMessageBodyTypeGuard.mockReturnValue(false);

      try {
        await makeIncomingMessages(
          testEvent,
          testIncomingMessageBodyTypeGuard as any,
          testLogger,
          testFailuresAllowed
        );
      } catch (error) {
        expect((error as Error).message).toContain("Failed to make message");
        expect(testLogger.error).toHaveBeenCalledTimes(1);
        expect(testLogger.error).toHaveBeenCalledWith(
          "Failed to make message",
          {
            error: expect.any(Error),
            messageId: "msg_1",
          }
        );
        expect((testLogger.error.mock.calls[0][1] as any).error.message).toBe(
          "Message did not conform to the expected type"
        );
      }
      expect.hasAssertions();
    });

    it("Throws an error by default if a given SQS message's body is not valid json", async () => {
      testEvent = {
        ...testEvent,
        Records: [
          ...testEvent.Records,
          {
            messageId: "msg_2",
            body: `"invalid": "json"`,
          },
        ],
      } as any;

      try {
        await makeIncomingMessages(
          testEvent,
          testIncomingMessageBodyTypeGuard as any,
          testLogger,
          testFailuresAllowed
        );
      } catch (error) {
        expect((error as Error).message).toContain("Failed to make message");
        expect(testLogger.error).toHaveBeenCalledTimes(1);
        expect(testLogger.error).toHaveBeenCalledWith(
          "Failed to make message",
          {
            error: expect.any(SyntaxError),
            messageId: "msg_2",
          }
        );
      }
      expect.hasAssertions();
    });

    describe("Failures allowed", () => {
      beforeEach(() => {
        testFailuresAllowed = true;
      });

      it("Returns failed ID if a given message does not conform to the specified type", async () => {
        testIncomingMessageBodyTypeGuard.mockReturnValue(false);

        const result = await makeIncomingMessages(
          testEvent,
          testIncomingMessageBodyTypeGuard as any,
          testLogger,
          testFailuresAllowed
        );

        expect(result).toEqual({
          incomingMessages: [],
          failedIds: ["msg_1"],
        });
        expect(testLogger.error).toHaveBeenCalledTimes(1);
        expect(testLogger.error).toHaveBeenCalledWith(
          "Failed to make message",
          {
            error: expect.any(Error),
            messageId: "msg_1",
          }
        );
        expect((testLogger.error.mock.calls[0][1] as any).error.message).toBe(
          "Message did not conform to the expected type"
        );
      });

      it("Returns failed ID if a given SQS message's body is not valid json", async () => {
        testEvent = {
          ...testEvent,
          Records: [
            ...testEvent.Records,
            {
              messageId: "msg_2",
              body: `"invalid": "json"`,
            },
          ],
        } as any;

        const result = await makeIncomingMessages(
          testEvent,
          testIncomingMessageBodyTypeGuard as any,
          testLogger,
          testFailuresAllowed
        );

        expect(result).toEqual({
          incomingMessages: [
            {
              id: "msg_1",
              body: {
                a: "something",
                b: 12,
                c: false,
              },
            },
          ],
          failedIds: ["msg_2"],
        });
        expect(testLogger.error).toHaveBeenCalledTimes(1);
        expect(testLogger.error).toHaveBeenCalledWith(
          "Failed to make message",
          {
            error: expect.any(SyntaxError),
            messageId: "msg_2",
          }
        );
      });
    });
  });

  describe("Incoming S3 event", () => {
    beforeEach(() => {
      testEvent = {
        Records: [
          {
            s3: {
              bucket: { name: "test-bucket" },
              object: { key: "test-key" },
            },
          },
        ],
      } as unknown as S3Event;
    });

    it("builds S3 messages", async () => {
      const result = await makeIncomingMessages(
        testEvent,
        testIncomingMessageBodyTypeGuard as any,
        testLogger,
        testFailuresAllowed
      );

      expect(result).toEqual({
        incomingMessages: [
          {
            body: mockedS3FileText,
            meta: {
              bucketName: "test-bucket",
              key: "test-key",
            },
          },
        ],
        failedIds: [],
      });
    });

    it("Throws an error if a given message does not conform to the specified type", async () => {
      testIncomingMessageBodyTypeGuard.mockReturnValue(false);

      try {
        await makeIncomingMessages(
          testEvent,
          testIncomingMessageBodyTypeGuard as any,
          testLogger,
          testFailuresAllowed
        );
      } catch (error) {
        expect((error as Error).message).toContain("Failed to make message");
        expect(testLogger.error).toHaveBeenCalledTimes(1);
        expect(testLogger.error).toHaveBeenCalledWith(
          "Failed to make message",
          {
            error: expect.any(Error),
            messageId: undefined,
          }
        );
        expect((testLogger.error.mock.calls[0][1] as any).error.message).toBe(
          "Message did not conform to the expected type"
        );
      }
      expect.hasAssertions();
    });

    it("Throws an error if the S3-object the message references cannot not be found", async () => {
      mockedFetchS3.mockRejectedValue(undefined);

      try {
        await makeIncomingMessages(
          testEvent,
          testIncomingMessageBodyTypeGuard as any,
          testLogger,
          testFailuresAllowed
        );
      } catch (error) {
        expect((error as Error).message).toContain(
          "The object this event references could not be found."
        );
      }
      expect.hasAssertions();
    });
  });
});
