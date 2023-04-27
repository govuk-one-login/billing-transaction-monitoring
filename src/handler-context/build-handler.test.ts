import { buildHandler } from "./build-handler";
import { ConfigElements } from "./config";
import { makeIncomingMessages } from "./make-incoming-messages";
import { outputMessages } from "./output-messages";
import { runBusinessLogic } from "./run-business-logic";
import { HandlerOutputs, buildContext } from "./context-builder";
import { BusinessLogic, HandlerCtx, HandlerOptions } from "./types";
import { logger } from "../shared/utils";

jest.mock("../shared/utils");
const mockedLogger = logger as jest.MockedObject<typeof logger>;

jest.mock("./context-builder");
const mockedBuildContext = buildContext as jest.Mock;

jest.mock("./make-incoming-messages");
const mockedMakeIncomingMessages = makeIncomingMessages as jest.Mock;

jest.mock("./output-messages");
const mockedOutputMessages = outputMessages as jest.Mock;

jest.mock("./run-business-logic");
const mockedRunBusinessLogic = runBusinessLogic as jest.Mock;

describe("buildHandler", () => {
  let mockedContext: HandlerCtx<any, any, any>;
  let mockedIncomingMessages: any[];
  let mockedOutgoingMessages: any[];
  let testBusinessLogic: BusinessLogic<any, any, any, any>;
  let testConfigCache: ConfigElements[];
  let testEnvVars: string[];
  let testEvent: any;
  let testIncomingMessageBodyTypeGuard: (x: unknown) => x is any;
  let testOptions: HandlerOptions<any, any, any, any>;
  let testOutputs: HandlerOutputs<any>;
  let testWithBatchItemFailures: boolean | undefined;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedContext = { logger: mockedLogger } as any;
    mockedBuildContext.mockResolvedValue(mockedContext);

    mockedIncomingMessages = "mocked incoming messages" as any;
    mockedMakeIncomingMessages.mockResolvedValue({
      incomingMessages: mockedIncomingMessages,
      failedIds: [],
    });

    mockedOutgoingMessages = "mocked outgoing messages" as any;
    mockedRunBusinessLogic.mockResolvedValue({
      outgoingMessages: mockedOutgoingMessages,
      failedIds: [],
    });

    mockedOutputMessages.mockResolvedValue({ failedIds: [] });

    testBusinessLogic = "given business logic" as any;
    testConfigCache = "given config items" as any;
    testEnvVars = "given environment variable keys" as any;
    testIncomingMessageBodyTypeGuard =
      "given incoming message body type guard" as any;
    testOutputs = "given outputs" as any;
    testWithBatchItemFailures = undefined;
    testOptions = {
      businessLogic: testBusinessLogic,
      envVars: testEnvVars,
      incomingMessageBodyTypeGuard: testIncomingMessageBodyTypeGuard,
      outputs: testOutputs,
      withBatchItemFailures: testWithBatchItemFailures,
      ConfigCache: testConfigCache,
    };

    testEvent = "given event";
  });

  describe("The handler it returns", () => {
    it("returns undefined by default", async () => {
      const result = await buildHandler(testOptions)(testEvent);

      expect(result).toBeUndefined();
      expect(mockedBuildContext).toHaveBeenCalledTimes(1);
      expect(mockedBuildContext).toHaveBeenCalledWith(
        mockedLogger,
        testOptions
      );
      expect(mockedMakeIncomingMessages).toHaveBeenCalledTimes(1);
      expect(mockedMakeIncomingMessages).toHaveBeenCalledWith(
        testEvent,
        testIncomingMessageBodyTypeGuard,
        mockedLogger,
        testWithBatchItemFailures
      );
      expect(mockedRunBusinessLogic).toHaveBeenCalledTimes(1);
      expect(mockedRunBusinessLogic).toHaveBeenCalledWith(
        testBusinessLogic,
        mockedIncomingMessages,
        mockedContext,
        testWithBatchItemFailures
      );
      expect(mockedOutputMessages).toHaveBeenCalledTimes(1);
      expect(mockedOutputMessages).toHaveBeenCalledWith(
        mockedOutgoingMessages,
        mockedContext,
        testWithBatchItemFailures
      );
      expect(mockedLogger.error).not.toHaveBeenCalled();
    });

    describe("Errors", () => {
      describe("Context builder failure", () => {
        it("throws context builder error", async () => {
          const mockedContextBuilderErrorMessage =
            "mocked context builder error message";
          const mockedContextBuilderError = new Error(
            mockedContextBuilderErrorMessage
          );
          mockedBuildContext.mockRejectedValue(mockedContextBuilderError);

          const resultPromise = buildHandler(testOptions)(testEvent);

          await expect(resultPromise).rejects.toThrow(
            mockedContextBuilderErrorMessage
          );
          expect(mockedBuildContext).toHaveBeenCalledTimes(1);
          expect(mockedBuildContext).toHaveBeenCalledWith(
            mockedLogger,
            testOptions
          );
          expect(mockedMakeIncomingMessages).not.toHaveBeenCalled();
          expect(mockedRunBusinessLogic).not.toHaveBeenCalled();
          expect(mockedOutputMessages).not.toHaveBeenCalled();
          expect(mockedLogger.error).toHaveBeenCalledTimes(1);
          expect(mockedLogger.error).toHaveBeenCalledWith("Handler failure", {
            error: mockedContextBuilderError,
          });
        });
      });

      describe("Incoming message parser failure", () => {
        it("throws error", async () => {
          const mockedIncomingMessageParserErrorMessage =
            "mocked incoming message parser error message";
          const mockedIncomingMessageParserError = new Error(
            mockedIncomingMessageParserErrorMessage
          );
          mockedMakeIncomingMessages.mockRejectedValue(
            mockedIncomingMessageParserError
          );

          const resultPromise = buildHandler(testOptions)(testEvent);

          await expect(resultPromise).rejects.toThrow(
            mockedIncomingMessageParserErrorMessage
          );
          expect(mockedBuildContext).toHaveBeenCalledTimes(1);
          expect(mockedBuildContext).toHaveBeenCalledWith(
            mockedLogger,
            testOptions
          );
          expect(mockedMakeIncomingMessages).toHaveBeenCalledTimes(1);
          expect(mockedMakeIncomingMessages).toHaveBeenCalledWith(
            testEvent,
            testIncomingMessageBodyTypeGuard,
            mockedLogger,
            testWithBatchItemFailures
          );
          expect(mockedRunBusinessLogic).not.toHaveBeenCalled();
          expect(mockedOutputMessages).not.toHaveBeenCalled();
          expect(mockedLogger.error).toHaveBeenCalledTimes(1);
          expect(mockedLogger.error).toHaveBeenCalledWith("Handler failure", {
            error: mockedIncomingMessageParserError,
          });
        });
      });

      describe("Business logic runner failure", () => {
        it("throws error", async () => {
          const mockedBusinessLogicRunnerErrorMessage =
            "mocked business logic runner error message";
          const mockedBusinessLogicRunnerError = new Error(
            mockedBusinessLogicRunnerErrorMessage
          );
          mockedRunBusinessLogic.mockRejectedValue(
            mockedBusinessLogicRunnerError
          );

          const resultPromise = buildHandler(testOptions)(testEvent);

          await expect(resultPromise).rejects.toThrow(
            mockedBusinessLogicRunnerErrorMessage
          );
          expect(mockedBuildContext).toHaveBeenCalledTimes(1);
          expect(mockedBuildContext).toHaveBeenCalledWith(
            mockedLogger,
            testOptions
          );
          expect(mockedMakeIncomingMessages).toHaveBeenCalledTimes(1);
          expect(mockedMakeIncomingMessages).toHaveBeenCalledWith(
            testEvent,
            testIncomingMessageBodyTypeGuard,
            mockedLogger,
            testWithBatchItemFailures
          );
          expect(mockedRunBusinessLogic).toHaveBeenCalledTimes(1);
          expect(mockedRunBusinessLogic).toHaveBeenCalledWith(
            testBusinessLogic,
            mockedIncomingMessages,
            mockedContext,
            testWithBatchItemFailures
          );
          expect(mockedOutputMessages).not.toHaveBeenCalled();
          expect(mockedLogger.error).toHaveBeenCalledTimes(1);
          expect(mockedLogger.error).toHaveBeenCalledWith("Handler failure", {
            error: mockedBusinessLogicRunnerError,
          });
        });
      });

      describe("Outgoing message sender failure", () => {
        it("throws error", async () => {
          const mockedOutgoingMessageSenderErrorMessage =
            "mocked outgoing message sender error message";
          const mockedOutgoingMessageSenderError = new Error(
            mockedOutgoingMessageSenderErrorMessage
          );
          mockedOutputMessages.mockRejectedValue(
            mockedOutgoingMessageSenderError
          );

          const resultPromise = buildHandler(testOptions)(testEvent);

          await expect(resultPromise).rejects.toThrow(
            mockedOutgoingMessageSenderErrorMessage
          );
          expect(mockedBuildContext).toHaveBeenCalledTimes(1);
          expect(mockedBuildContext).toHaveBeenCalledWith(
            mockedLogger,
            testOptions
          );
          expect(mockedMakeIncomingMessages).toHaveBeenCalledTimes(1);
          expect(mockedMakeIncomingMessages).toHaveBeenCalledWith(
            testEvent,
            testIncomingMessageBodyTypeGuard,
            mockedLogger,
            testWithBatchItemFailures
          );
          expect(mockedRunBusinessLogic).toHaveBeenCalledTimes(1);
          expect(mockedRunBusinessLogic).toHaveBeenCalledWith(
            testBusinessLogic,
            mockedIncomingMessages,
            mockedContext,
            testWithBatchItemFailures
          );
          expect(mockedOutputMessages).toHaveBeenCalledTimes(1);
          expect(mockedOutputMessages).toHaveBeenCalledWith(
            mockedOutgoingMessages,
            mockedContext,
            testWithBatchItemFailures
          );
          expect(mockedLogger.error).toHaveBeenCalledTimes(1);
          expect(mockedLogger.error).toHaveBeenCalledWith("Handler failure", {
            error: mockedOutgoingMessageSenderError,
          });
        });
      });
    });

    describe("Batch item failures", () => {
      let mockedFailedIncomingId: string;
      let mockedFailedBusinessLogicId: string;
      let mockedFailedOutputId: string;

      beforeEach(() => {
        mockedFailedIncomingId = "mocked failed incoming message ID";
        mockedMakeIncomingMessages.mockResolvedValue({
          incomingMessages: mockedIncomingMessages,
          failedIds: [mockedFailedIncomingId],
        });

        mockedFailedBusinessLogicId = "mocked failed business logic message ID";
        mockedRunBusinessLogic.mockResolvedValue({
          outgoingMessages: mockedOutgoingMessages,
          failedIds: [mockedFailedBusinessLogicId],
        });

        mockedFailedOutputId = "mocked failed otuput message ID";
        mockedOutputMessages.mockResolvedValue({
          failedIds: [mockedFailedOutputId],
        });

        testWithBatchItemFailures = true;
        testOptions.withBatchItemFailures = testWithBatchItemFailures;
      });

      it("returns failed message IDs from message parsing, business logic, and message sending", async () => {
        const result = await buildHandler(testOptions)(testEvent);

        expect(result).toEqual({
          batchItemFailures: [
            mockedFailedIncomingId,
            mockedFailedBusinessLogicId,
            mockedFailedOutputId,
          ],
        });
        expect(mockedBuildContext).toHaveBeenCalledTimes(1);
        expect(mockedBuildContext).toHaveBeenCalledWith(
          mockedLogger,
          testOptions
        );
        expect(mockedMakeIncomingMessages).toHaveBeenCalledTimes(1);
        expect(mockedMakeIncomingMessages).toHaveBeenCalledWith(
          testEvent,
          testIncomingMessageBodyTypeGuard,
          mockedLogger,
          testWithBatchItemFailures
        );
        expect(mockedRunBusinessLogic).toHaveBeenCalledTimes(1);
        expect(mockedRunBusinessLogic).toHaveBeenCalledWith(
          testBusinessLogic,
          mockedIncomingMessages,
          mockedContext,
          testWithBatchItemFailures
        );
        expect(mockedOutputMessages).toHaveBeenCalledTimes(1);
        expect(mockedOutputMessages).toHaveBeenCalledWith(
          mockedOutgoingMessages,
          mockedContext,
          testWithBatchItemFailures
        );
        expect(mockedLogger.error).not.toHaveBeenCalled();
      });
    });
  });
});
