import { handler } from './handler'
import { SQSRecord } from 'aws-lambda'
import AWS from 'aws-sdk'

var mockSendMessage = jest.fn();

jest.mock('aws-sdk', () => {
    return {
        SQS: jest.fn(() => ({
            sendMessage: mockSendMessage
        })),
    };
});

describe('Filter handler tests',() => {

    test('Filter handler with empty event batch', async () => {

      const event = {
        Records: []
      };

      handler(event);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test('Filter handler with valid type event', async () => {

      const record : SQSRecord = {
          body: JSON.stringify({
              timestamp: 1609462861,
              event_name: 'IPV_PASSPORT_CRI_REQUEST_SENT',
              component_id: 'KBV'
          })
      } as any;

      const event = {
        Records: [record]
      };

      handler(event);

      expect(mockSendMessage).toHaveBeenCalled();
    });

    test('Filter handler with invalid type event', async () => {

      const record : SQSRecord = {
          body: JSON.stringify({
              timestamp: 1609462861,
              event_name: 'SOME_OTHER_EVENT_TYPE',
              component_id: 'KBV'
          })
      } as any;

      const event = {
        Records: [record]
      };

      handler(event);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });
});
