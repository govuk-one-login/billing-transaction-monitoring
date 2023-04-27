import { outputMessages } from "./output-messages";
import {
  HandlerCtx,
  HandlerMessageBody,
  HandlerOutgoingMessage,
} from "./types";

describe("outputMessages", () => {
  let givenCtx: HandlerCtx<any, any, any>;
  let givenErrorLogger: jest.Mock;
  let givenFailuresAllowed: boolean | undefined;
  let givenMessages: Array<HandlerOutgoingMessage<HandlerMessageBody>>;
  let givenOutputDestination1: string;
  let givenOutputDestination2: string;
  let givenOutputStorageFunction1: jest.Mock;
  let givenOutputStorageFunction2: jest.Mock;
  let expectedErrorMessageDefault: string;
  let expectedErrorMessageStorage: string;

  beforeEach(() => {
    givenErrorLogger = jest.fn();

    givenOutputDestination1 = "given output destination 1";
    givenOutputDestination2 = "given output destination 2";
    givenOutputStorageFunction1 = jest.fn();
    givenOutputStorageFunction2 = jest.fn();

    givenCtx = {
      logger: {
        error: givenErrorLogger,
      },
      outputs: [
        {
          destination: givenOutputDestination1,
          store: givenOutputStorageFunction1,
        },
        {
          destination: givenOutputDestination2,
          store: givenOutputStorageFunction2,
        },
      ],
    } as any;

    givenFailuresAllowed = undefined;

    expectedErrorMessageDefault = "Output failure";
    expectedErrorMessageStorage = "Storage failure";
  });

  describe("message body objects", () => {
    let givenMessage1A: HandlerOutgoingMessage<object>;
    let givenMessage1B: HandlerOutgoingMessage<object>;
    let givenMessage2: HandlerOutgoingMessage<object>;
    let givenMessageBody1A: object;
    let givenMessageBody1B: object;
    let givenMessageBody2: object;
    let givenMessageOriginalId1: string;
    let givenMessageOriginalId2: string;

    beforeEach(() => {
      givenMessageBody1A = { foo: "1a" };
      givenMessageBody1B = { foo: "1b" };
      givenMessageBody2 = { foo: "2" };

      givenMessageOriginalId1 = "given message ID 1";
      givenMessageOriginalId2 = "given message ID 2";

      givenMessage1A = {
        originalId: givenMessageOriginalId1,
        body: givenMessageBody1A,
      };

      givenMessage1B = {
        originalId: givenMessageOriginalId1,
        body: givenMessageBody1B,
      };

      givenMessage2 = {
        originalId: givenMessageOriginalId2,
        body: givenMessageBody2,
      };

      givenMessages = [givenMessage1A, givenMessage1B, givenMessage2];
    });

    it("calls given output storage functions with given output destinations and message body", async () => {
      const result = await outputMessages(
        givenMessages,
        givenCtx,
        givenFailuresAllowed
      );

      expect(result).toEqual({ failedIds: [] });
      expect(givenOutputStorageFunction1).toHaveBeenCalledTimes(3);
      expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
        givenOutputDestination1,
        givenMessageBody1A,
        givenCtx
      );
      expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
        givenOutputDestination1,
        givenMessageBody1B,
        givenCtx
      );
      expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
        givenOutputDestination1,
        givenMessageBody2,
        givenCtx
      );
      expect(givenOutputStorageFunction2).toHaveBeenCalledTimes(3);
      expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
        givenOutputDestination2,
        givenMessageBody1A,
        givenCtx
      );
      expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
        givenOutputDestination2,
        givenMessageBody1B,
        givenCtx
      );
      expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
        givenOutputDestination2,
        givenMessageBody2,
        givenCtx
      );
      expect(givenErrorLogger).not.toHaveBeenCalled();
    });

    describe("storage error", () => {
      let mockedError: Error;

      beforeEach(() => {
        mockedError = new Error("mocked error");
        givenOutputStorageFunction1.mockRejectedValue(mockedError);
      });

      it("throws error by default", async () => {
        const resultPromise = outputMessages(
          givenMessages,
          givenCtx,
          givenFailuresAllowed
        );

        await expect(resultPromise).rejects.toThrow(
          expectedErrorMessageDefault
        );
        expect(givenOutputStorageFunction1).toHaveBeenCalledTimes(3);
        expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
          givenOutputDestination1,
          givenMessageBody1A,
          givenCtx
        );
        expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
          givenOutputDestination1,
          givenMessageBody1B,
          givenCtx
        );
        expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
          givenOutputDestination1,
          givenMessageBody2,
          givenCtx
        );
        expect(givenOutputStorageFunction2).toHaveBeenCalledTimes(3);
        expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
          givenOutputDestination2,
          givenMessageBody1A,
          givenCtx
        );
        expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
          givenOutputDestination2,
          givenMessageBody1B,
          givenCtx
        );
        expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
          givenOutputDestination2,
          givenMessageBody2,
          givenCtx
        );
        expect(givenErrorLogger).toHaveBeenCalledTimes(6);
        expect(givenErrorLogger).toHaveBeenCalledWith(
          expectedErrorMessageStorage,
          {
            destination: givenOutputDestination1,
            error: mockedError,
          }
        );
        expect(givenErrorLogger).toHaveBeenCalledWith(
          expectedErrorMessageDefault,
          {
            error: expect.any(Error),
            incomingMessageId: givenMessageOriginalId1,
          }
        );
        expect(givenErrorLogger).toHaveBeenCalledWith(
          expectedErrorMessageDefault,
          {
            error: expect.any(Error),
            incomingMessageId: givenMessageOriginalId2,
          }
        );
      });

      describe("failures allowed", () => {
        beforeEach(() => {
          givenFailuresAllowed = true;
        });

        describe("message has no ID", () => {
          beforeEach(() => {
            delete givenMessage1A.originalId;
          });

          it("throws error", async () => {
            const resultPromise = outputMessages(
              givenMessages,
              givenCtx,
              givenFailuresAllowed
            );

            await expect(resultPromise).rejects.toThrow(
              expectedErrorMessageDefault
            );
            expect(givenOutputStorageFunction1).toHaveBeenCalledTimes(3);
            expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
              givenOutputDestination1,
              givenMessageBody1A,
              givenCtx
            );
            expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
              givenOutputDestination1,
              givenMessageBody1B,
              givenCtx
            );
            expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
              givenOutputDestination1,
              givenMessageBody2,
              givenCtx
            );
            expect(givenOutputStorageFunction2).toHaveBeenCalledTimes(3);
            expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
              givenOutputDestination2,
              givenMessageBody1A,
              givenCtx
            );
            expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
              givenOutputDestination2,
              givenMessageBody1B,
              givenCtx
            );
            expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
              givenOutputDestination2,
              givenMessageBody2,
              givenCtx
            );
            expect(givenErrorLogger).toHaveBeenCalledTimes(6);
            expect(givenErrorLogger).toHaveBeenCalledWith(
              expectedErrorMessageStorage,
              {
                destination: givenOutputDestination1,
                error: mockedError,
              }
            );
            expect(givenErrorLogger).toHaveBeenCalledWith(
              expectedErrorMessageDefault,
              {
                error: expect.any(Error),
                incomingMessageId: undefined,
              }
            );
            expect(givenErrorLogger).toHaveBeenCalledWith(
              expectedErrorMessageDefault,
              {
                error: expect.any(Error),
                incomingMessageId: givenMessageOriginalId2,
              }
            );
          });
        });

        describe("messages have IDs", () => {
          it("returns failed message IDs", async () => {
            const result = await outputMessages(
              givenMessages,
              givenCtx,
              givenFailuresAllowed
            );

            expect(result).toEqual({
              failedIds: [givenMessageOriginalId1, givenMessageOriginalId2],
            });
            expect(givenOutputStorageFunction1).toHaveBeenCalledTimes(3);
            expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
              givenOutputDestination1,
              givenMessageBody1A,
              givenCtx
            );
            expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
              givenOutputDestination1,
              givenMessageBody1B,
              givenCtx
            );
            expect(givenOutputStorageFunction1).toHaveBeenCalledWith(
              givenOutputDestination1,
              givenMessageBody2,
              givenCtx
            );
            expect(givenOutputStorageFunction2).toHaveBeenCalledTimes(3);
            expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
              givenOutputDestination2,
              givenMessageBody1A,
              givenCtx
            );
            expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
              givenOutputDestination2,
              givenMessageBody1B,
              givenCtx
            );
            expect(givenOutputStorageFunction2).toHaveBeenCalledWith(
              givenOutputDestination2,
              givenMessageBody2,
              givenCtx
            );
            expect(givenErrorLogger).toHaveBeenCalledTimes(6);
            expect(givenErrorLogger).toHaveBeenCalledWith(
              expectedErrorMessageStorage,
              {
                destination: givenOutputDestination1,
                error: mockedError,
              }
            );
            expect(givenErrorLogger).toHaveBeenCalledWith(
              expectedErrorMessageDefault,
              {
                error: expect.any(Error),
                incomingMessageId: givenMessageOriginalId1,
              }
            );
            expect(givenErrorLogger).toHaveBeenCalledWith(
              expectedErrorMessageDefault,
              {
                error: expect.any(Error),
                incomingMessageId: givenMessageOriginalId2,
              }
            );
          });
        });
      });
    });
  });

  describe("batching", () => {
    let originalPromiseAllSettled: typeof Promise.allSettled;
    let mockedPromiseAllSettled: jest.Mock;

    beforeEach(() => {
      originalPromiseAllSettled = Promise.allSettled;

      mockedPromiseAllSettled = jest.fn((promises: any[]) =>
        Array(promises.length).fill({ status: "fulfilled" })
      );

      global.Promise.allSettled = mockedPromiseAllSettled;

      givenCtx.outputs = [
        {
          destination: givenOutputDestination1,
          store: givenOutputStorageFunction1,
        },
      ];
    });

    afterEach(() => {
      global.Promise.allSettled = originalPromiseAllSettled;
    });

    it("batches <= 1000 correctly", async () => {
      const givenMessageCount = 1000;
      givenMessages = Array(givenMessageCount).fill({
        body: "given message body",
      });

      await outputMessages(givenMessages, givenCtx);

      const expectedBatchPromiseCount = 1;
      expect(mockedPromiseAllSettled).toHaveBeenCalledTimes(
        givenMessageCount + expectedBatchPromiseCount
      );
    });

    it("batches > 1000 correctly", async () => {
      const givenMessageCount = 1001;
      givenMessages = Array(givenMessageCount).fill({
        body: "given message body",
      });

      await outputMessages(givenMessages, givenCtx);

      const expectedBatchPromiseCount = 2;
      expect(mockedPromiseAllSettled).toHaveBeenCalledTimes(
        givenMessageCount + expectedBatchPromiseCount
      );
    });
  });
});
