import { handler } from "./handler";
import {
  createEvent,
  createEventRecordWithName,
} from "../../../test-helpers/SQS";
import { putS3 } from "../../shared/utils";

jest.mock("../../shared/utils");
const mockPutS3 = putS3 as jest.MockedFunction<typeof putS3>;

const OLD_ENV = process.env;
const oldConsoleError = console.error;
const oldConsoleLog = console.log;

beforeEach(() => {
  process.env = { ...OLD_ENV };
  console.error = jest.fn();
  console.log = jest.fn();
  mockPutS3.mockClear();
  process.env.STORAGE_BUCKET = "store";
});

afterAll(() => {
  process.env = OLD_ENV;
  console.error = oldConsoleError;
  console.log = oldConsoleLog;
});

test("Store Transactions handler with empty event batch", async () => {
  const event = createEvent([]);

  await handler(event);

  expect(mockPutS3).not.toHaveBeenCalled();
});

test("Store Transactions handler with some valid events calls s3", async () => {
  const validRecord1 = createEventRecordWithName(
    "IPV_PASSPORT_CRI_REQUEST_SENT",
    1
  );
  const validRecord2 = createEventRecordWithName(
    "IPV_ADDRESS_CRI_REQUEST_SENT",
    2
  );
  const event = createEvent([validRecord1, validRecord2]);

  await handler(event);

  expect(mockPutS3).toHaveBeenCalledTimes(2);

  const recordBody1 = JSON.parse(validRecord1.body);
  const expectedDate1 = new Date(recordBody1.timestamp);
  const expectedKey1 = `${expectedDate1.getUTCFullYear()}-${
    expectedDate1.getUTCMonth() + 1
  }-${expectedDate1.getUTCDate()}/${recordBody1.event_id as string}.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(
    1,
    "store",
    expectedKey1,
    JSON.parse(validRecord1.body)
  );

  const recordBody2 = JSON.parse(validRecord2.body);
  const expectedDate2 = new Date(recordBody2.timestamp);
  const expectedKey2 = `${expectedDate2.getUTCFullYear()}-${
    expectedDate2.getUTCMonth() + 1
  }-${expectedDate2.getUTCDate()}/${recordBody2.event_id as string}.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(
    2,
    "store",
    expectedKey2,
    JSON.parse(validRecord2.body)
  );
});

test("Bucket name not defined", async () => {
  process.env.STORAGE_BUCKET = undefined;

  const validRecord = createEventRecordWithName(
    "IPV_PASSPORT_CRI_REQUEST_SENT",
    1
  );

  const event = createEvent([validRecord]);

  const result = await handler(event);

  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual("1");
});

test("Failing puts to S3", async () => {
  const validRecord = createEventRecordWithName(
    "IPV_PASSPORT_CRI_REQUEST_SENT",
    1
  );
  const invalidRecord = createEventRecordWithName(
    "IPV_ADDRESS_CRI_REQUEST_SENT",
    2
  );

  const event = createEvent([validRecord, invalidRecord]);

  mockPutS3.mockResolvedValueOnce().mockRejectedValueOnce("An error");

  const result = await handler(event);

  expect(mockPutS3).toHaveBeenCalledTimes(2);

  const recordBody1 = JSON.parse(validRecord.body);
  const expectedDate1 = new Date(recordBody1.timestamp);
  const expectedKey1 = `${expectedDate1.getUTCFullYear()}-${
    expectedDate1.getUTCMonth() + 1
  }-${expectedDate1.getUTCDate()}/${recordBody1.event_id as string}.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(
    1,
    "store",
    expectedKey1,
    JSON.parse(validRecord.body)
  );

  const recordBody2 = JSON.parse(invalidRecord.body);
  const expectedDate2 = new Date(recordBody2.timestamp);
  const expectedKey2 = `${expectedDate2.getUTCFullYear()}-${
    expectedDate2.getUTCMonth() + 1
  }-${expectedDate2.getUTCDate()}/${recordBody2.event_id as string}.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(
    2,
    "store",
    expectedKey2,
    JSON.parse(invalidRecord.body)
  );

  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual("2");
});
