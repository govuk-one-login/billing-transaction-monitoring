import {handler} from './handler'
import {SQSHelper} from '../../../test-helpers/SQS'
import {sendRecord} from '../../shared/utils'

jest.mock('../../shared/utils');
const mockedSendRecord = sendRecord as jest.MockedFunction<typeof sendRecord>

describe('Filter handler tests', () => {

  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    mockedSendRecord.mockClear();
    process.env.OUTPUT_QUEUE_URL = 'output-queue-url';
  })

  afterAll(() => {
    process.env = OLD_ENV;
  });


  test('Filter handler with empty event batch', async () => {

    const event = SQSHelper.createEvent([]);

    await handler(event);

    expect(mockedSendRecord).not.toHaveBeenCalled();
  });


  test('Filter handler with some valid events and some ignored', async () => {

    const validRecord1 = SQSHelper.createEventRecordWithName('EVENT_1', 1);
    const validRecord2 = SQSHelper.createEventRecordWithName('EVENT_5', 2);
    const ignoredRecord = SQSHelper.createEventRecordWithName('SOME_IGNORED_EVENT_NAME', 3);
    const event = SQSHelper.createEvent([validRecord1, validRecord2, ignoredRecord]);

    await handler(event);

    expect(mockedSendRecord).toHaveBeenCalledTimes(2);
    expect(mockedSendRecord).toHaveBeenNthCalledWith(1, 'output-queue-url', validRecord1.body);
    expect(mockedSendRecord).toHaveBeenNthCalledWith(2,'output-queue-url', validRecord2.body);
  });


  test('SQS output queue not defined', async () => {

    process.env.OUTPUT_QUEUE_URL = undefined;

    const validRecord = SQSHelper.createEventRecordWithName('EVENT_1', 1);

    const event = SQSHelper.createEvent([validRecord]);

    const result = await handler(event);
    expect(result.batchItemFailures.length).toEqual(1);
    expect(result.batchItemFailures[0].itemIdentifier).toEqual(1);
  });


  test('Failing send message', async () => {
    const validRecord = SQSHelper.createEventRecordWithName('EVENT_1',1);
    const invalidRecord = SQSHelper.createEventRecordWithName('EVENT_5', 2);

    const event = SQSHelper.createEvent([validRecord, invalidRecord]);

    mockedSendRecord
        .mockImplementationOnce(async () => {})
        .mockImplementationOnce(async () => {
          throw new Error('error');
        });

    const result = await handler(event);

    expect(mockedSendRecord).toHaveBeenCalledTimes(2);
    expect(mockedSendRecord).toHaveBeenNthCalledWith(1, 'output-queue-url', validRecord.body);
    expect(mockedSendRecord).toHaveBeenNthCalledWith(2,'output-queue-url', invalidRecord.body);
    expect(result.batchItemFailures.length).toEqual(1);
    expect(result.batchItemFailures[0].itemIdentifier).toEqual(2);
  });
});
