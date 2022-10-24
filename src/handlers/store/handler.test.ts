import {handler} from './handler'
import {SQSHelper} from '../../../test-helpers/SQS'
import {putS3,putDDB} from "../../shared/utils";

jest.mock("../../shared/utils");
const mockPutS3 = putS3 as jest.MockedFunction<typeof putS3>;
const mockPutDDB = putDDB as jest.MockedFunction<typeof putDDB>;

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV };
  mockPutS3.mockClear();
  mockPutDDB.mockClear();
  process.env.STORAGE_BUCKET = 'store';
  process.env.STORAGE_TABLE = 'store_ddb';
})

afterAll(() => {
  process.env = OLD_ENV;
});

test('Store handler with empty event batch', async () => {
  const event = SQSHelper.createEvent([]);

  await handler(event);

  expect(mockPutS3).not.toHaveBeenCalled();
  expect(mockPutDDB).not.toHaveBeenCalled();
});

test('Store handler with some valid events calls s3', async () => {
  const validRecord1 = SQSHelper.createEventRecordWithName('IPV_PASSPORT_CRI_REQUEST_SENT', 1);
  const validRecord2 = SQSHelper.createEventRecordWithName('IPV_ADDRESS_CRI_REQUEST_SENT', 2);
  const event = SQSHelper.createEvent([validRecord1, validRecord2]);

  await handler(event);

  expect(mockPutS3).toHaveBeenCalledTimes(2);

  const recordBody1 = JSON.parse(validRecord1.body);
  const expectedDate1 = new Date(recordBody1.timestamp);
  const expectedKey1 = `${expectedDate1.getUTCFullYear()}/${expectedDate1.getUTCMonth() + 1}/${expectedDate1.getUTCDate()}/${recordBody1.event_id}.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(1, 'store', expectedKey1,JSON.parse(validRecord1.body));

  const recordBody2 = JSON.parse(validRecord2.body);
  const expectedDate2 = new Date(recordBody2.timestamp);
  const expectedKey2 = `${expectedDate2.getUTCFullYear()}/${expectedDate2.getUTCMonth() + 1}/${expectedDate2.getUTCDate()}/${recordBody2.event_id}.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(2, 'store', expectedKey2, JSON.parse(validRecord2.body));
});

test('Store handler with some valid events calls ddb', async () => {
  const validRecord1 = SQSHelper.createEventRecordWithName('IPV_PASSPORT_CRI_REQUEST_SENT', 1);
  const validRecord2 = SQSHelper.createEventRecordWithName('IPV_ADDRESS_CRI_REQUEST_SENT', 2);
  const event = SQSHelper.createEvent([validRecord1, validRecord2]);

  await handler(event);

  expect(mockPutDDB).toHaveBeenCalledTimes(2);
  expect(mockPutDDB).toHaveBeenNthCalledWith(1, 'store_ddb', JSON.parse(validRecord1.body));
  expect(mockPutDDB).toHaveBeenNthCalledWith(2, 'store_ddb', JSON.parse(validRecord2.body));
});

test('Bucket name not defined', async () => {
  process.env.STORAGE_BUCKET = undefined;

  const validRecord = SQSHelper.createEventRecordWithName('IPV_PASSPORT_CRI_REQUEST_SENT', 1);

  const event = SQSHelper.createEvent([validRecord]);

  const result = await handler(event);

  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual(1);
});

test('Table name not defined', async () => {
  process.env.STORAGE_TABLE = undefined;

  const validRecord = SQSHelper.createEventRecordWithName('IPV_PASSPORT_CRI_REQUEST_SENT', 1);

  const event = SQSHelper.createEvent([validRecord]);

  const result = await handler(event);

  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual(1);
});

test('Failing puts to S3', async () => {
  const validRecord = SQSHelper.createEventRecordWithName('IPV_PASSPORT_CRI_REQUEST_SENT',1);
  const invalidRecord = SQSHelper.createEventRecordWithName('IPV_ADDRESS_CRI_REQUEST_SENT', 2);

  const event = SQSHelper.createEvent([validRecord, invalidRecord]);

  mockPutS3.mockResolvedValueOnce().mockRejectedValueOnce("An error");

  const result = await handler(event);

  expect(mockPutS3).toHaveBeenCalledTimes(2);

  const recordBody1 = JSON.parse(validRecord.body);
  const expectedDate1 = new Date(recordBody1.timestamp);
  const expectedKey1 = `${expectedDate1.getUTCFullYear()}/${expectedDate1.getUTCMonth() + 1}/${expectedDate1.getUTCDate()}/${recordBody1.event_id}.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(1, 'store', expectedKey1, JSON.parse(validRecord.body));

  const recordBody2 = JSON.parse(invalidRecord.body);
  const expectedDate2 = new Date(recordBody2.timestamp);
  const expectedKey2 = `${expectedDate2.getUTCFullYear()}/${expectedDate2.getUTCMonth() + 1}/${expectedDate2.getUTCDate()}/${recordBody2.event_id}.json`;
  expect(mockPutS3).toHaveBeenNthCalledWith(2, 'store', expectedKey2, JSON.parse(invalidRecord.body));

  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual(2);
});
