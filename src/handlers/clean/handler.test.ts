import { createEvent, createRecord } from "../../../test-helpers/SQS";
import { SqsQueue } from "../../driven/sqs-queue";
import { VendorServiceConfigStore } from "../../driven/vendor-service-config";
import { cleanEventAdapter } from "../../driving/clean-event-adapter";

const mockedSendRecord = jest.fn();

const handler = cleanEventAdapter({
  vendorServiceConfigStore: {
    getVendorIdByEventName: async () =>
      await new Promise((resolve) => resolve("vendor_testvendor1")),
  } as unknown as VendorServiceConfigStore,
  sqsQueue: { sendRecord: mockedSendRecord } as unknown as SqsQueue,
});

describe("Clean handler tests", () => {
  const OLD_ENV = process.env;
  const oldConsoleError = console.error;
  const oldConsoleLog = console.log;
  let validRecordBodyObject: Object;
  let sentRecordBodyObject: Object;
  const TIMESTAMP_SECONDS = 123;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    mockedSendRecord.mockClear();
    process.env.AWS_ENV = "aws-env";
    process.env.OUTPUT_QUEUE_URL = "output-queue-url";

    console.error = jest.fn();
    console.log = jest.fn();

    validRecordBodyObject = {
      component_id: "some component ID",
      event_name: "VENDOR_1_EVENT_1",
      timestamp: TIMESTAMP_SECONDS,
      event_id: "abc-123-id",
      timestamp_formatted: "2023-02-13T09:26:18.000Z",
    };

    sentRecordBodyObject = {
      ...validRecordBodyObject,
      timestamp: 1000 * TIMESTAMP_SECONDS,
      vendor_id: "vendor_testvendor1",
      user: {},
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error = oldConsoleError;
    console.log = oldConsoleLog;
  });

  test("Clean handler with empty event batch", async () => {
    const event = createEvent([]);

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(0);
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Clean handler with minimal invalid event record", async () => {
    const recordBodyWithInvalidComponentId = JSON.stringify({
      ...validRecordBodyObject,
      component_id: 456,
    });
    const recordBodyWithInvalidTimestamp = JSON.stringify({
      ...validRecordBodyObject,
      timestamp: "some timestamp string",
    });
    const event = createEvent([
      createRecord("", "message ID 1"),
      createRecord("some non-empty string", "message ID 2"),
      createRecord(recordBodyWithInvalidComponentId, "message ID 3"),
      createRecord(recordBodyWithInvalidTimestamp, "message ID 4"),
    ]);

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(4);
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
    expect(mockedSendRecord).not.toHaveBeenCalled();
  });

  test("Clean handler with minimal valid event record", async () => {
    const recordBody = JSON.stringify(validRecordBodyObject);
    const record = createRecord(recordBody);
    const event = createEvent([record]);

    expect(mockedSendRecord).not.toHaveBeenCalled();

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(0);
    expect(mockedSendRecord).toHaveBeenCalledTimes(1);
    expect(mockedSendRecord).toHaveBeenCalledWith(
      process.env.OUTPUT_QUEUE_URL,
      JSON.stringify(sentRecordBodyObject)
    );
  });

  test("Clean handler with valid event record that has optional values", async () => {
    const recordBodyObject = {
      ...validRecordBodyObject,
      user: {
        transaction_id: "some transaction ID",
      },
    };
    const recordBody = JSON.stringify(recordBodyObject);
    const record = createRecord(recordBody);
    const event = createEvent([record]);
    const expectedRecordBody = {
      ...recordBodyObject,
      timestamp: TIMESTAMP_SECONDS * 1000,
      vendor_id: "vendor_testvendor1",
    };

    expect(mockedSendRecord).not.toHaveBeenCalled();

    const result = await handler(event);

    expect(result).toEqual({
      batchItemFailures: expect.any(Array),
    });
    expect(result.batchItemFailures).toHaveLength(0);
    expect(mockedSendRecord).toHaveBeenCalledTimes(1);
    const resultSendRecordArguments = mockedSendRecord.mock.calls[0];
    expect(resultSendRecordArguments).toHaveLength(2);
    const resultRecordBodyObject = JSON.parse(resultSendRecordArguments[1]);
    expect(resultRecordBodyObject).toEqual(expectedRecordBody);
    expect(resultSendRecordArguments[0]).toBe(process.env.OUTPUT_QUEUE_URL);
  });

  test("SQS output queue not defined", async () => {
    process.env.OUTPUT_QUEUE_URL = undefined;

    const messageId = "some message ID";
    const recordBody = JSON.stringify(validRecordBodyObject);
    const record = createRecord(recordBody, messageId);
    const event = createEvent([record]);

    await expect(handler(event)).rejects.toThrowError(
      "No OUTPUT_QUEUE_URL defined in this environment"
    );
  });
});
