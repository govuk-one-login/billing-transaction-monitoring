import { handler } from "./handler";
import {
  createEvent,
  createEventRecordWithName,
} from "../../../test-helpers/SQS";
import { formatDate, putS3 } from "../../shared/utils";

jest.mock("../../shared/utils/s3");
const mockPutS3 = putS3 as jest.MockedFunction<typeof putS3>;

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV };
  mockPutS3.mockClear();
  process.env.STORAGE_BUCKET = "store";
  process.env.EVENT_DATA_FOLDER = "btm_event_data";
});

afterAll(() => {
  process.env = OLD_ENV;
});

test("Store Transactions handler with empty event batch", async () => {
  const event = createEvent([]);

  await handler(event);

  expect(mockPutS3).not.toHaveBeenCalled();
});

test("Store Transactions handler with some valid events calls s3", async () => {
  const validRecord1 = createEventRecordWithName("EVENT_1", 1);
  const validRecord2 = createEventRecordWithName("EVENT_5", 2);
  const event = createEvent([validRecord1, validRecord2]);

  await handler(event);

  expect(mockPutS3).toHaveBeenCalledTimes(2);

  const recordBody1 = JSON.parse(validRecord1.body);
  const expectedDate1 = new Date(recordBody1.timestamp);
  const yearMonthFolderDay1 = formatDate(expectedDate1, "/");
  const expectedKey1 = `btm_event_data/${yearMonthFolderDay1}/${
    recordBody1.event_id as string
  }.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(
    1,
    "store",
    expectedKey1,
    JSON.parse(validRecord1.body)
  );

  const recordBody2 = JSON.parse(validRecord2.body);
  const expectedDate2 = new Date(recordBody2.timestamp);
  const yearMonthDayFolder2 = formatDate(expectedDate2, "/");
  const expectedKey2 = `btm_event_data/${yearMonthDayFolder2}/${
    recordBody2.event_id as string
  }.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(
    2,
    "store",
    expectedKey2,
    JSON.parse(validRecord2.body)
  );
});

test("Bucket name not defined", async () => {
  process.env.STORAGE_BUCKET = undefined;

  const validRecord = createEventRecordWithName("EVENT_1", 1);

  const event = createEvent([validRecord]);

  const result = await handler(event);

  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual("1");
});

test("Event data folder name not defined", async () => {
  process.env.EVENT_DATA_FOLDER = undefined;

  const validRecord = createEventRecordWithName("EVENT_1", 1);

  const event = createEvent([validRecord]);

  const result = await handler(event);

  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual("1");
});

test("Failing puts to S3", async () => {
  const validRecord = createEventRecordWithName("EVENT_1", 1);
  const invalidRecord = createEventRecordWithName("EVENT_5", 2);

  const event = createEvent([validRecord, invalidRecord]);

  mockPutS3.mockResolvedValueOnce().mockRejectedValueOnce("An error");

  const result = await handler(event);

  expect(mockPutS3).toHaveBeenCalledTimes(2);

  const recordBody1 = JSON.parse(validRecord.body);
  const expectedDate1 = new Date(recordBody1.timestamp);
  const yearMonthDayFolder1 = formatDate(expectedDate1, "/");
  const expectedKey1 = `btm_event_data/${yearMonthDayFolder1}/${
    recordBody1.event_id as string
  }.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(
    1,
    "store",
    expectedKey1,
    JSON.parse(validRecord.body)
  );

  const recordBody2 = JSON.parse(invalidRecord.body);
  const expectedDate2 = new Date(recordBody2.timestamp);
  const yearMonthDayFolder2 = formatDate(expectedDate2, "/");
  const expectedKey2 = `btm_event_data/${yearMonthDayFolder2}/${
    recordBody2.event_id as string
  }.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(
    2,
    "store",
    expectedKey2,
    JSON.parse(invalidRecord.body)
  );

  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual("2");
});
