import {mockClient} from "aws-sdk-client-mock";
import {SendMessageCommand, SQSClient} from "@aws-sdk/client-sqs";
import {sendRecord} from "./sqs";
import {SQSRecord} from "aws-lambda";

const sqsMock = mockClient(SQSClient);

describe("Record sender tests", () => {
  const oldConsoleLog = console.log;
  const queueUrl = "given queue URL";
  const record = "given record" as unknown as SQSRecord;

  beforeEach(() => {
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = oldConsoleLog;
  });

  test("Record sender with callback error", async () => {
    sqsMock.on(SendMessageCommand).rejects('An error');

    await expect(sendRecord(queueUrl, record)).rejects.toMatchObject({message: 'An error'});
    expect(sqsMock.calls()[0].firstArg.input).toEqual({
      MessageBody: JSON.stringify(record),
      QueueUrl: queueUrl,
    });
  });

  test("Record sender without callback error", async () => {
    sqsMock.on(SendMessageCommand).resolves({});

    await sendRecord(queueUrl, record);

    expect(sqsMock.calls()[0].firstArg.input).toEqual({
      MessageBody: JSON.stringify(record),
      QueueUrl: queueUrl,
    });
  });
});
