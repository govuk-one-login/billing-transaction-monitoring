import { runBusinessLogic } from "./run-business-logic";
import { BusinessLogic, HandlerCtx, HandlerIncomingMessage } from "./types";

describe("runBusinessLogic", () => {
  let mockedOutgoingMessageBody1A: string;
  let mockedOutgoingMessageBody1B: string;
  let mockedOutgoingMessageBody2: string;
  let givenBusinessLogic: BusinessLogic<any, any, any, any>;
  let givenContext: HandlerCtx<any, any, any>;
  let givenErrorLogger: jest.Mock;
  let givenFailuresAllowed: boolean | undefined;
  let givenIncomingMessageBody1: string;
  let givenIncomingMessageBody2: string;
  let givenIncomingMessageId1: string;
  let givenIncomingMessageId2: string;
  let givenIncomingMessages: Array<HandlerIncomingMessage<any>>;
  let expectedErrorMessage: string;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedOutgoingMessageBody1A = "mocked outgoing message body 1A";
    mockedOutgoingMessageBody1B = "mocked outgoing message body 1B";
    mockedOutgoingMessageBody2 = "mocked outgoing message body 2";

    givenBusinessLogic = jest
      .fn()
      .mockResolvedValueOnce([
        mockedOutgoingMessageBody1A,
        mockedOutgoingMessageBody1B,
      ])
      .mockResolvedValueOnce([mockedOutgoingMessageBody2]);

    givenErrorLogger = jest.fn();

    givenContext = {
      logger: {
        error: givenErrorLogger,
      },
    } as any;

    givenFailuresAllowed = undefined;

    givenIncomingMessageId1 = "given incoming message ID 1";
    givenIncomingMessageBody1 = "given incoming message body 1";

    givenIncomingMessageId2 = "given incoming message ID 2";
    givenIncomingMessageBody2 = "given incoming message body 2";

    givenIncomingMessages = [
      {
        id: givenIncomingMessageId1,
        body: givenIncomingMessageBody1,
      },
      {
        id: givenIncomingMessageId2,
        body: givenIncomingMessageBody2,
      },
    ];

    expectedErrorMessage = "Business logic failure";
  });

  it("returns results of given business logic with given messages", async () => {
    const result = await runBusinessLogic(
      givenBusinessLogic,
      givenIncomingMessages,
      givenContext,
      givenFailuresAllowed
    );

    expect(result).toEqual({
      outgoingMessages: [
        {
          originalId: givenIncomingMessageId1,
          body: mockedOutgoingMessageBody1A,
        },
        {
          originalId: givenIncomingMessageId1,
          body: mockedOutgoingMessageBody1B,
        },
        {
          originalId: givenIncomingMessageId2,
          body: mockedOutgoingMessageBody2,
        },
      ],
      failedIds: [],
    });
    expect(givenBusinessLogic).toHaveBeenCalledTimes(2);
    expect(givenBusinessLogic).toHaveBeenCalledWith(
      givenIncomingMessageBody1,
      givenContext
    );
    expect(givenBusinessLogic).toHaveBeenCalledWith(
      givenIncomingMessageBody2,
      givenContext
    );
    expect(givenErrorLogger).not.toHaveBeenCalled();
  });

  describe("business logic error", () => {
    let mockedError: Error;

    beforeEach(() => {
      mockedError = new Error("mocked error");

      givenBusinessLogic = jest
        .fn()
        .mockRejectedValueOnce(mockedError)
        .mockResolvedValueOnce([mockedOutgoingMessageBody2]);
    });

    it("throws error by default", async () => {
      const resultPromise = runBusinessLogic(
        givenBusinessLogic,
        givenIncomingMessages,
        givenContext,
        givenFailuresAllowed
      );

      await expect(resultPromise).rejects.toThrow(expectedErrorMessage);
      expect(givenBusinessLogic).toHaveBeenCalledTimes(2);
      expect(givenBusinessLogic).toHaveBeenCalledWith(
        givenIncomingMessageBody1,
        givenContext
      );
      expect(givenBusinessLogic).toHaveBeenCalledWith(
        givenIncomingMessageBody2,
        givenContext
      );
      expect(givenErrorLogger).toHaveBeenCalledTimes(1);
      expect(givenErrorLogger).toHaveBeenCalledWith(expectedErrorMessage, {
        error: mockedError,
        messageId: givenIncomingMessageId1,
      });
    });

    describe("failures allowed", () => {
      beforeEach(() => {
        givenFailuresAllowed = true;
      });

      it("returns successful message bodies and failed message IDs", async () => {
        const result = await runBusinessLogic(
          givenBusinessLogic,
          givenIncomingMessages,
          givenContext,
          givenFailuresAllowed
        );

        expect(result).toEqual({
          outgoingMessages: [
            {
              originalId: givenIncomingMessageId2,
              body: mockedOutgoingMessageBody2,
            },
          ],
          failedIds: [givenIncomingMessageId1],
        });
        expect(givenBusinessLogic).toHaveBeenCalledTimes(2);
        expect(givenBusinessLogic).toHaveBeenCalledWith(
          givenIncomingMessageBody1,
          givenContext
        );
        expect(givenBusinessLogic).toHaveBeenCalledWith(
          givenIncomingMessageBody2,
          givenContext
        );
        expect(givenErrorLogger).toHaveBeenCalledTimes(1);
        expect(givenErrorLogger).toHaveBeenCalledWith(expectedErrorMessage, {
          error: mockedError,
          messageId: givenIncomingMessageId1,
        });
      });

      describe("undefined message ID", () => {
        beforeEach(() => {
          delete givenIncomingMessages[0].id;
        });

        it("throws error", async () => {
          const resultPromise = runBusinessLogic(
            givenBusinessLogic,
            givenIncomingMessages,
            givenContext,
            givenFailuresAllowed
          );

          await expect(resultPromise).rejects.toThrow(expectedErrorMessage);
          expect(givenBusinessLogic).toHaveBeenCalledTimes(2);
          expect(givenBusinessLogic).toHaveBeenCalledWith(
            givenIncomingMessageBody1,
            givenContext
          );
          expect(givenBusinessLogic).toHaveBeenCalledWith(
            givenIncomingMessageBody2,
            givenContext
          );
          expect(givenErrorLogger).toHaveBeenCalledTimes(1);
          expect(givenErrorLogger).toHaveBeenCalledWith(expectedErrorMessage, {
            error: mockedError,
            messageId: undefined,
          });
        });
      });
    });
  });
});
