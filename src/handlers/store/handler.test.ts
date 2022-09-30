const mockPut = jest.fn((params, callback) => {
  callback();
});

import {handler} from './handler'
import {SQSHelper} from '../../../test-helpers/SQS'

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        put: mockPut
      }))
    }
  };
});

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV };
  mockPut.mockClear();
  process.env.STORAGE_TABLE = 'store-table';
})

afterAll(() => {
  process.env = OLD_ENV;
});

test('Store handler with empty event batch', async () => {
  const event = SQSHelper.createEvent([]);

  await handler(event);

  expect(mockPut).not.toHaveBeenCalled();
});

test('Store handler with some valid events', async () => {
  const validRecord1 = SQSHelper.createEventRecordWithName('EVENT_1', 1);
  const validRecord2 = SQSHelper.createEventRecordWithName('EVENT_5', 2);
  const event = SQSHelper.createEvent([validRecord1, validRecord2]);

  await handler(event);

  expect(mockPut).toHaveBeenCalledTimes(2);
  expect(mockPut).toHaveBeenNthCalledWith(1, {Item: validRecord1, TableName: 'store-table' }, expect.any(Function));
  expect(mockPut).toHaveBeenNthCalledWith(2,{Item: validRecord2, TableName: 'store-table' }, expect.any(Function));
});

test('Table name not defined', async () => {
  process.env.STORAGE_TABLE = undefined;

  const validRecord = SQSHelper.createEventRecordWithName('EVENT_1', 1);

  const event = SQSHelper.createEvent([validRecord]);

  const result = await handler(event);

  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual(1);
});

test('Failing puts to DynamoDB', async () => {
  const validRecord = SQSHelper.createEventRecordWithName('EVENT_1',1);
  const invalidRecord = SQSHelper.createEventRecordWithName('EVENT_5', 2);

  const event = SQSHelper.createEvent([validRecord, invalidRecord]);

  mockPut
      .mockImplementationOnce((params, callback) => callback())
      .mockImplementationOnce((params, callback) => callback('error'));

  const result = await handler(event);

  expect(mockPut).toHaveBeenCalledTimes(2);
  expect(mockPut).toHaveBeenNthCalledWith(1, {Item: validRecord, TableName: 'store-table' }, expect.any(Function));
  expect(mockPut).toHaveBeenNthCalledWith(2,{Item: invalidRecord, TableName: 'store-table' }, expect.any(Function));
  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual(2);
});
