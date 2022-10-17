import {handler} from './handler'
import {SQSHelper} from '../../../test-helpers/SQS'
import {putS3} from "../../shared/utils";

jest.mock("../../shared/utils");
const mockPut = putS3 as jest.MockedFunction<typeof putS3>;

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV };
  mockPut.mockClear();
  process.env.STORAGE_BUCKET = 'store';
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
  const validRecord1 = SQSHelper.createEventRecordWithName('IPV_PASSPORT_CRI_REQUEST_SENT', 1);
  const validRecord2 = SQSHelper.createEventRecordWithName('IPV_ADDRESS_CRI_REQUEST_SENT', 2);
  const event = SQSHelper.createEvent([validRecord1, validRecord2]);

  await handler(event);

  expect(mockPut).toHaveBeenCalledTimes(2);

  const recordBody1 = JSON.parse(validRecord1.body);
  const expectedDate1 = new Date(recordBody1.timestamp);
  const expectedKey1 = `event-name=${recordBody1.event_name}/year=${expectedDate1.getUTCFullYear()}/month=${expectedDate1.getUTCMonth() + 1}/day=${expectedDate1.getUTCDate()}/event-id=${recordBody1.event_id}`;
  expect(mockPut).toHaveBeenNthCalledWith(1, 'store', expectedKey1,JSON.parse(validRecord1.body));

  const recordBody2 = JSON.parse(validRecord2.body);
  const expectedDate2 = new Date(recordBody2.timestamp);
  const expectedKey2 = `event-name=${recordBody2.event_name}/year=${expectedDate2.getUTCFullYear()}/month=${expectedDate2.getUTCMonth() + 1}/day=${expectedDate2.getUTCDate()}/event-id=${recordBody2.event_id}`;
  expect(mockPut).toHaveBeenNthCalledWith(2, 'store', expectedKey2, JSON.parse(validRecord2.body));
});

test('Bucket name not defined', async () => {
  process.env.STORAGE_BUCKET = undefined;

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

  mockPut.mockResolvedValueOnce().mockRejectedValueOnce("An error");

  const result = await handler(event);

  expect(mockPut).toHaveBeenCalledTimes(2);

  const recordBody1 = JSON.parse(validRecord.body);
  const expectedDate1 = new Date(recordBody1.timestamp);
  const expectedKey1 = `event-name=${recordBody1.event_name}/year=${expectedDate1.getUTCFullYear()}/month=${expectedDate1.getUTCMonth() + 1}/day=${expectedDate1.getUTCDate()}/event-id=${recordBody1.event_id}`;
  expect(mockPut).toHaveBeenNthCalledWith(1, 'store', expectedKey1, JSON.parse(validRecord.body));

  const recordBody2 = JSON.parse(invalidRecord.body);
  const expectedDate2 = new Date(recordBody2.timestamp);
  const expectedKey2 = `event-name=${recordBody2.event_name}/year=${expectedDate2.getUTCFullYear()}/month=${expectedDate2.getUTCMonth() + 1}/day=${expectedDate2.getUTCDate()}/event-id=${recordBody2.event_id}`;
  expect(mockPut).toHaveBeenNthCalledWith(2, 'store', expectedKey2, JSON.parse(invalidRecord.body));

  expect(result.batchItemFailures.length).toEqual(1);
  expect(result.batchItemFailures[0].itemIdentifier).toEqual(2);
});
