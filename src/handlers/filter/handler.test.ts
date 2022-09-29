const mockSendMessage = jest.fn((params, callback) => {
  callback();
});

import {handler} from './handler'
import {SQSRecord} from 'aws-lambda'

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

    const event = createEvent([]);

    await handler(event);

    expect(mockSendMessage).not.toHaveBeenCalled();
  });


  test('Filter handler with some valid events and some ignored', async () => {

    const validRecord1 = createEventRecordWithName('IPV_PASSPORT_CRI_REQUEST_SENT', 1);
    const validRecord2 = createEventRecordWithName('IPV_ADDRESS_CRI_REQUEST_SENT', 2);
    const ignoredRecord = createEventRecordWithName('SOME_IGNORED_EVENT_NAME', 3);
    const event = createEvent([validRecord1, validRecord2, ignoredRecord]);

    await handler(event);

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
    expect(mockSendMessage).toHaveBeenNthCalledWith(1, {MessageBody: JSON.stringify(validRecord1), QueueUrl: 'output-queue-url' }, expect.any(Function));
    expect(mockSendMessage).toHaveBeenNthCalledWith(2,{MessageBody: JSON.stringify(validRecord2), QueueUrl: 'output-queue-url' }, expect.any(Function));
  });


  test('SQS output queue not defined', async () => {

    process.env.OUTPUT_QUEUE_URL = undefined;

    const validRecord = createEventRecordWithName('IPV_PASSPORT_CRI_REQUEST_SENT', 1);

    const event = createEvent([validRecord]);

    const result = await handler(event);
    expect(result.batchItemFailures.length).toEqual(1);
    expect(result.batchItemFailures[0].itemIdentifier).toEqual(1);
  });


  test('Failing send message', async () => {
    const validRecord = createEventRecordWithName('IPV_PASSPORT_CRI_REQUEST_SENT',1);
    const invalidRecord = createEventRecordWithName('IPV_ADDRESS_CRI_REQUEST_SENT', 2);

    const event = createEvent([validRecord, invalidRecord]);

    mockSendMessage
        .mockImplementationOnce((params, callback) => callback())
        .mockImplementationOnce((params, callback) => callback('error'));

    const result = await handler(event);

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
    expect(mockSendMessage).toHaveBeenNthCalledWith(1, {MessageBody: JSON.stringify(validRecord), QueueUrl: 'output-queue-url' }, expect.any(Function));
    expect(mockSendMessage).toHaveBeenNthCalledWith(2,{MessageBody: JSON.stringify(invalidRecord), QueueUrl: 'output-queue-url' }, expect.any(Function));
    expect(result.batchItemFailures.length).toEqual(1);
    expect(result.batchItemFailures[0].itemIdentifier).toEqual(2);
  });


  function createEvent(records: Array<SQSRecord>) {
    return {
      Records: records
    };
  }

  function createEventRecordWithName(name: String, messageId: Number): SQSRecord {
    return {
      body: JSON.stringify({
        event_name: name,
        timestamp: Date.now(),
        component_id: 'KBV',
        messageId,
      })
    } as any;
  }
});
