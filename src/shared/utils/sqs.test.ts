import { SQSRecord } from "aws-lambda";
import { SQS } from "aws-sdk";
import { sendRecord, RecordSenderArgument } from "./sqs";

describe("Record sender tests", () => {
  const oldConsoleLog = console.log;
  let givenArgument: RecordSenderArgument;
  let mockedSendMessage: jest.Mock<unknown>;

  beforeEach(() => {
    console.log = jest.fn();
    mockedSendMessage = jest.fn();

    givenArgument = {
      queueUrl: "given queue URL",
      record: "given record" as unknown as SQSRecord,
      sqs: {
        sendMessage: mockedSendMessage,
      } as unknown as SQS,
    };
  });

  afterAll(() => {
    console.log = oldConsoleLog;
  });

  test("Record sender with callback error", async () => {
    const resultPromise = sendRecord(givenArgument);

    expect(mockedSendMessage).toHaveBeenCalledTimes(1);

    const resultSendMessageArguments = mockedSendMessage.mock.calls[0];
    expect(resultSendMessageArguments).toHaveLength(2);

    expect(resultSendMessageArguments[0]).toEqual({
      MessageBody: JSON.stringify(givenArgument.record),
      QueueUrl: givenArgument.queueUrl,
    });

    const resultCallback = resultSendMessageArguments[1];
    resultCallback("some error");
    let resultPromiseFailed = false;
    try {
      await resultPromise;
    } catch (e) {
      resultPromiseFailed = true;
    }
    expect(resultPromiseFailed).toBe(true);
  });

  test("Record sender without callback error", async () => {
    const resultPromise = sendRecord(givenArgument);

    expect(mockedSendMessage).toHaveBeenCalledTimes(1);

    const resultSendMessageArguments = mockedSendMessage.mock.calls[0];
    expect(resultSendMessageArguments).toHaveLength(2);

    const resultCallback = resultSendMessageArguments[1];
    resultCallback();
    const result = await resultPromise;
    expect(result).toBe("success");
  });
});
