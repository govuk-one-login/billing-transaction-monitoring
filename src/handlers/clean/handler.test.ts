import { SQSRecord } from "aws-lambda";
import { SQS } from "aws-sdk";
import { SQSHelper } from "../../../test-helpers/SQS";
import { VALID_EVENT_NAMES } from "../../shared/constants";
import { sendRecord } from "../../shared/utils";
import { handler } from "./handler";

jest.mock("aws-sdk");
const MockedSQS = SQS as jest.MockedClass<typeof SQS>;

jest.mock("../../shared/utils");
const mockedSendRecord = sendRecord as jest.MockedFunction<typeof sendRecord>;

describe("Clean handler tests", () => {
  const OLD_ENV = process.env;
  const oldConsoleError = console.error;
  let validRecordBodyObject: Object;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    mockedSendRecord.mockClear();
    process.env.AWS_ENV = "aws-env";
    process.env.OUTPUT_QUEUE_URL = "output-queue-url";

    console.error = jest.fn();

    validRecordBodyObject = {
      component_id: "some component ID",
      event_name: VALID_EVENT_NAMES.values().next().value,
      timestamp: 123,
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
  });

  test("Clean handler with empty event batch", async () => {
    const event = SQSHelper.createEvent([]);

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(0);
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Clean handler with event whose records have invalid bodies", async () => {
    const recordBodyWithInvalidComponentId = JSON.stringify({
      ...validRecordBodyObject,
      component_id: 456,
    });
    const recordBodyWithInvalidEventName = JSON.stringify({
      ...validRecordBodyObject,
      event_name: "some event name string",
    });
    const recordBodyWithInvalidTimestamp = JSON.stringify({
      ...validRecordBodyObject,
      timestamp: "some timestamp string",
    });
    const event = SQSHelper.createEvent([
      createRecord("", "message ID 1"),
      createRecord("some non-empty string", "message ID 2"),
      createRecord(recordBodyWithInvalidComponentId, "message ID 3"),
      createRecord(recordBodyWithInvalidEventName, "message ID 4"),
      createRecord(recordBodyWithInvalidTimestamp, "message ID 5"),
    ]);

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(5);
    expect(result.batchItemFailures[0]).toEqual({
      itemIdentifier: "message ID 1",
    });
    expect(result.batchItemFailures[1]).toEqual({
      itemIdentifier: "message ID 2",
    });
    expect(result.batchItemFailures[2]).toEqual({
      itemIdentifier: "message ID 3",
    });
    expect(result.batchItemFailures[3]).toEqual({
      itemIdentifier: "message ID 4",
    });
    expect(result.batchItemFailures[4]).toEqual({
      itemIdentifier: "message ID 5",
    });
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Clean handler with minimal valid event record", async () => {
    const recordBody = JSON.stringify(validRecordBodyObject);
    const record = createRecord(recordBody);
    const event = SQSHelper.createEvent([record]);

    expect(mockedSendRecord).not.toHaveBeenCalled();

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(0);
    expect(mockedSendRecord).toHaveBeenCalledTimes(1);
    const resultSendRecordArguments = mockedSendRecord.mock.calls[0];
    expect(resultSendRecordArguments).toHaveLength(1);
    const resultSendRecordArgument = resultSendRecordArguments[0];
    expect(resultSendRecordArgument.sqs).toBe(MockedSQS.mock.instances[0]);
    const resultRecordBodyObject = JSON.parse(
      resultSendRecordArgument.record.body
    );
    expect(resultRecordBodyObject).toEqual(validRecordBodyObject);
    expect(resultSendRecordArgument.queueUrl).toBe(
      process.env.OUTPUT_QUEUE_URL
    );
  });

  test("Clean handler with valid event record that has unwanted field", async () => {
    const recordBody = JSON.stringify({
      ...validRecordBodyObject,
      someUnwantedField: "some value",
    });
    const record = createRecord(recordBody);
    const event = SQSHelper.createEvent([record]);

    expect(mockedSendRecord).not.toHaveBeenCalled();

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(0);
    expect(mockedSendRecord).toHaveBeenCalledTimes(1);
    const resultSendRecordArguments = mockedSendRecord.mock.calls[0];
    expect(resultSendRecordArguments).toHaveLength(1);
    const resultSendRecordArgument = resultSendRecordArguments[0];
    expect(resultSendRecordArgument.sqs).toBe(MockedSQS.mock.instances[0]);
    const resultRecordBodyObject = JSON.parse(
      resultSendRecordArgument.record.body
    );
    expect(resultRecordBodyObject).toEqual(validRecordBodyObject);
    expect(resultSendRecordArgument.queueUrl).toBe(
      process.env.OUTPUT_QUEUE_URL
    );
  });

  test("Clean handler with valid event record that has invalid optional values", async () => {
    const recordBody = JSON.stringify({
      ...validRecordBodyObject,
      client_id: 123,
      event_id: 234,
      extensions: "some string",
      timestamp_formatted: 345,
      user: {
        transaction_id: 456,
      },
    });
    const record = createRecord(recordBody);
    const event = SQSHelper.createEvent([record]);

    expect(mockedSendRecord).not.toHaveBeenCalled();

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(0);
    expect(mockedSendRecord).toHaveBeenCalledTimes(1);
    const resultSendRecordArguments = mockedSendRecord.mock.calls[0];
    expect(resultSendRecordArguments).toHaveLength(1);
    const resultSendRecordArgument = resultSendRecordArguments[0];
    expect(resultSendRecordArgument.sqs).toBe(MockedSQS.mock.instances[0]);
    const resultRecordBodyObject = JSON.parse(
      resultSendRecordArgument.record.body
    );
    expect(resultRecordBodyObject).toEqual({
      ...validRecordBodyObject,
      user: {},
    });
    expect(resultSendRecordArgument.queueUrl).toBe(
      process.env.OUTPUT_QUEUE_URL
    );
  });

  test("Clean handler with valid event record that has valid optional values", async () => {
    const recordBodyObject = {
      ...validRecordBodyObject,
      client_id: "some client ID",
      event_id: "some event ID",
      extensions: {
        iss: "some ISS",
      },
      timestamp_formatted: "some formatted timestamp",
      user: {
        transaction_id: "some transaction ID",
      },
    };
    const recordBody = JSON.stringify(recordBodyObject);
    const record = createRecord(recordBody);
    const event = SQSHelper.createEvent([record]);

    expect(mockedSendRecord).not.toHaveBeenCalled();

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(0);
    expect(mockedSendRecord).toHaveBeenCalledTimes(1);
    const resultSendRecordArguments = mockedSendRecord.mock.calls[0];
    expect(resultSendRecordArguments).toHaveLength(1);
    const resultSendRecordArgument = resultSendRecordArguments[0];
    expect(resultSendRecordArgument.sqs).toBe(MockedSQS.mock.instances[0]);
    const resultRecordBodyObject = JSON.parse(
      resultSendRecordArgument.record.body
    );
    expect(resultRecordBodyObject).toEqual(recordBodyObject);
    expect(resultSendRecordArgument.queueUrl).toBe(
      process.env.OUTPUT_QUEUE_URL
    );
  });

  test("SQS output queue not defined", async () => {
    process.env.OUTPUT_QUEUE_URL = undefined;

    const messageId = "some message ID";
    const recordBody = JSON.stringify(validRecordBodyObject);
    const record = createRecord(recordBody, messageId);
    const event = SQSHelper.createEvent([record]);

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(1);
    expect(result.batchItemFailures[0]).toEqual({
      itemIdentifier: messageId,
    });
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Clean handler with valid event record in local environment", async () => {
    process.env.AWS_ENV = "local";
    process.env.LOCALSTACK_HOSTNAME = "localstack_hostname";
    process.env.OUTPUT_QUEUE_URL = "http://localhost:123/localhost-queue";

    const recordBody = JSON.stringify(validRecordBodyObject);
    const record = createRecord(recordBody);
    const event = SQSHelper.createEvent([record]);

    await handler(event);

    expect(mockedSendRecord).toHaveBeenCalledTimes(1);
    const resultSendRecordArguments = mockedSendRecord.mock.calls[0];
    const resultSendRecordArgument = resultSendRecordArguments[0];
    expect(resultSendRecordArgument.queueUrl).toBe(
      "http://localstack_hostname:123/localhost-queue"
    );
  });

  function createRecord(body: String, messageId?: string): SQSRecord {
    return { body, messageId } as any;
  }
});
