import { handler } from './handler'


//handler({Records: []});


describe('Filter handler tests',() => {
    test('Filter handler with empty event', async () => {

      const event = {
        Records: []
      };

      handler(event);
    });
});