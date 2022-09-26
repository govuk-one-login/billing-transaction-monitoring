const mockSendMessage = jest.fn((params, callback) => { callback() });

import { handler } from './handler'
import { SQSRecord } from 'aws-lambda'

import AWS from 'aws-sdk'

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

      const event = {
        Records: []
      };

      await handler(event);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test('Filter handler with valid type event', async () => {

      const record = createEventWithName('IPV_PASSPORT_CRI_REQUEST_SENT');

      const event = {
        Records: [record]
      };

      await handler(event);

      expect(mockSendMessage).toHaveBeenCalled();
    });

    test('Filter handler with invalid type event', async () => {

      const record = createEventWithName('SOME_OTHER_EVENT_TYPE');

      const event = {
        Records: [record]
      };

      await handler(event);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    function createEventWithName(name: String) : SQSRecord {
          const record : SQSRecord = {
              body: JSON.stringify({
                  timestamp: 1609462861,
                  event_name: name,
                  component_id: 'KBV'
              })
          } as any;
          return record;
    }
});
