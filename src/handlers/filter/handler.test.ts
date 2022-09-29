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

    const validRecord1 = createEventRecordWithName('EVENT_1');
    const validRecord2 = createEventRecordWithName('EVENT_5');
    const ignoredRecord = createEventRecordWithName('SOME_IGNORED_EVENT_NAME');
    const event = createEvent([validRecord1, validRecord2, ignoredRecord]);

    await handler(event);

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
  });


  test('SQS output queue not defined', async () => {

    process.env.OUTPUT_QUEUE_URL = undefined;

    const validRecord = createEventRecordWithName('EVENT_1');

    const event = createEvent([validRecord]);

    const result = await handler(event);
    expect(result.batchItemFailures.length).toEqual(1);
  });


  function createEvent(records: Array<SQSRecord>) {
    return {
      Records: records
    };
  }

  function createEventRecordWithName(name: String): SQSRecord {
    return {
      body: JSON.stringify({
        event_name: name,
        timestamp: Date.now(),
        component_id: 'KBV'
      })
    } as any;
  }
});
