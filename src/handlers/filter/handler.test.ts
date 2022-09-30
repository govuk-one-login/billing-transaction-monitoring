const mockSendMessage = jest.fn((params, callback) => {
  callback();
});

import {handler} from './handler'
import {SQSHelper} from '../../../test-helpers/SQS'

jest.mock('aws-sdk', () => {
  return {
    SQS: jest.fn(() => ({
      sendMessage: mockSendMessage
    }))
  };
});


describe('Filter handler tests', () => {

  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    mockSendMessage.mockClear();
    process.env.OUTPUT_QUEUE_URL = 'output-queue-url';
  })

  afterAll(() => {
    process.env = OLD_ENV;
  });


  test('Filter handler with empty event batch', async () => {

    const event = SQSHelper.createEvent([]);

    await handler(event);

    expect(mockSendMessage).not.toHaveBeenCalled();
  });


  test('Filter handler with some valid events and some ignored', async () => {

    const validRecord1 = SQSHelper.createEventRecordWithName('EVENT_1', 1);
    const validRecord2 = SQSHelper.createEventRecordWithName('EVENT_5', 2);
    const ignoredRecord = SQSHelper.createEventRecordWithName('SOME_IGNORED_EVENT_NAME', 3);
    const event = SQSHelper.createEvent([validRecord1, validRecord2, ignoredRecord]);

    await handler(event);

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
    expect(mockSendMessage).toHaveBeenNthCalledWith(1, {MessageBody: validRecord1.body, QueueUrl: 'output-queue-url' }, expect.any(Function));
    expect(mockSendMessage).toHaveBeenNthCalledWith(2,{MessageBody: validRecord2.body, QueueUrl: 'output-queue-url' }, expect.any(Function));
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

    mockSendMessage
        .mockImplementationOnce((params, callback) => callback())
        .mockImplementationOnce((params, callback) => callback('error'));

    const result = await handler(event);

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
    expect(mockSendMessage).toHaveBeenNthCalledWith(1, {MessageBody: validRecord.body, QueueUrl: 'output-queue-url' }, expect.any(Function));
    expect(mockSendMessage).toHaveBeenNthCalledWith(2,{MessageBody: invalidRecord.body, QueueUrl: 'output-queue-url' }, expect.any(Function));
    expect(result.batchItemFailures.length).toEqual(1);
    expect(result.batchItemFailures[0].itemIdentifier).toEqual(2);
  });
});
