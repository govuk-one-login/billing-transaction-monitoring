const mockSendMessage = jest.fn((params, callback) => { callback() });

import {handler} from './handler'
import {SQSRecord} from 'aws-lambda'

jest.mock('aws-sdk', () => {
    return {
        SQS: jest.fn(() => ({
                 sendMessage: mockSendMessage
             })),
    };
});


describe('Filter handler tests',() => {

    beforeEach(() => {
        mockSendMessage.mockClear();
    })


    test('Filter handler with empty event batch', async () => {

      const event = createEvent([]);

      await handler(event);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });


    test('Filter handler with some valid events and some ignored', async () => {

      const validEvent1 = createEventRecordWithName('IPV_PASSPORT_CRI_REQUEST_SENT');
      const validEvent2 = createEventRecordWithName('IPV_ADDRESS_CRI_REQUEST_SENT');
      const ignoredEvent = createEventRecordWithName('SOME_IGNORED_EVENT_NAME');
      const event = createEvent([validEvent1, validEvent2, ignoredEvent]);

      await handler(event);

      expect(mockSendMessage).toHaveBeenCalledTimes(2);
    });


    function createEvent(records : Array<SQSRecord>) {
        return {
            Records: records
        };
    }

    function createEventRecordWithName(name: String) : SQSRecord {
        return {
              body: JSON.stringify({
                  timestamp: Date.now(),
                  event_name: name,
                  component_id: 'KBV'
              })
          } as any;
    }
});
