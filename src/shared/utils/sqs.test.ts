import { mockClient } from "aws-sdk-client-mock";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { sendRecord } from "./sqs";

const sqsMock = mockClient(SQSClient);

describe("Record sender tests", () => {
  const oldConsoleLog = console.log;
  const queueUrl = "given queue URL";
  let record = '{"some": "things"}';

  beforeEach(() => {
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = oldConsoleLog;
  });

  test("Record sender with callback error", async () => {
    sqsMock.on(SendMessageCommand).rejects("An error");

    await expect(sendRecord(queueUrl, record)).rejects.toMatchObject({
      message: "An error",
    });
    expect(sqsMock.calls()[0].firstArg.input).toEqual({
      MessageBody: record,
      QueueUrl: queueUrl,
    });
  });

  test("Record sender without callback error", async () => {
    sqsMock.on(SendMessageCommand).resolves({});

    await sendRecord(queueUrl, record);

    expect(sqsMock.calls()[1].firstArg.input).toEqual({
      MessageBody: record,
      QueueUrl: queueUrl,
    });
  });

  test("Sending record containing an event_id", async () => {
    sqsMock.on(SendMessageCommand).resolves({});
    record = '{"event_id": "abc_123", "something": "else"}';
    await sendRecord(queueUrl, record);

    expect(console.log).toHaveBeenCalledWith(expect.stringMatching("abc_123"));
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringMatching("something")
    );

    expect(sqsMock.calls()[2].firstArg.input).toEqual({
      MessageBody: record,
      QueueUrl: queueUrl,
    });
  });
});
