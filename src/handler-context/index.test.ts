import { S3Event, SQSEvent } from "aws-lambda";
import { buildHandler, CtxBuilderOptions } from ".";
import { ConfigFileNames } from "./Config/types";

jest.mock("./S3ConfigClient", () => ({
  S3ConfigFileClient: jest.fn(() => ({
    getConfigFile: jest.fn(async (path) => {
      switch (path) {
        case ConfigFileNames.inferences:
          return "mock inferences";
        case ConfigFileNames.rates:
          return "mock rates";
        case ConfigFileNames.standardisation:
          return "mock standardisation";
        default:
          throw new Error("No config found");
      }
    }),
  })),
}));

jest.mock("../shared/utils/S3", () => ({
  fetchS3: jest.fn(async (_name, key) => {
    switch (key) {
      case "test-key":
        return "test document";
      default:
        throw new Error("No document found");
    }
  }),
}));

interface TestMessage {
  a: string;
  b: number;
  c: boolean;
}
type TestEnvVars = "THIS" | "THAT" | "THE_OTHER";
type TestConfigFiles = ConfigFileNames.inferences | ConfigFileNames.rates;

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const testSQSEvent = {
  Records: [
    {
      messageId: "msg_1",
      body: '{"a":"something","b":12,"c":false}',
    },
  ],
} as SQSEvent;

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const testS3Event = {
  Records: [
    {
      s3: {
        bucket: { name: "test-bucket" },
        object: { key: "test-key" },
      },
    },
  ],
} as S3Event;

const mockStoreFunction1 = jest.fn(async () => await Promise.resolve());
const mockStoreFunction2 = jest.fn(async () => await Promise.resolve());

const testOptions: CtxBuilderOptions<
  TestMessage,
  TestEnvVars,
  TestConfigFiles
> = {
  envVars: ["THIS", "THAT", "THE_OTHER"],
  messageTypeGuard: (message: any): message is TestMessage =>
    typeof message.a === "string" &&
    typeof message.b === "number" &&
    typeof message.c === "boolean",
  outputs: [
    {
      destination: "THAT",
      store: mockStoreFunction1,
    },
    {
      destination: "THE_OTHER",
      store: mockStoreFunction2,
    },
  ],
  configFiles: [ConfigFileNames.inferences, ConfigFileNames.rates],
};

describe("buildHandler", () => {
  describe("The handler it returns", () => {
    beforeEach(() => {
      process.env.THIS = "this";
      process.env.THAT = "that";
      process.env.THE_OTHER = "the other";
      process.env.CONFIG_BUCKET = "mock-config-bucket";
    });
    afterAll(() => {
      delete process.env.THIS;
      delete process.env.THAT;
      delete process.env.THE_OTHER;
      delete process.env.CONFIG_BUCKET;
    });
    it.each([
      {
        event: testSQSEvent,
        expectedOutput: '{"a":"something","b":12,"c":false}',
      },
      { event: testS3Event, expectedOutput: "test document" },
    ])(
      "creates a context, invokes the business logic with that context, then sends to results of the business logic to the specified outputs",
      async ({ event, expectedOutput }) => {
        await buildHandler(testOptions)(
          jest.fn(async ({ messages }) => {
            return messages;
          })
        )(event);

        expect(mockStoreFunction1).toHaveBeenLastCalledWith(
          "that",
          expectedOutput
        );
        expect(mockStoreFunction2).toHaveBeenLastCalledWith(
          "the other",
          expectedOutput
        );
      }
    );

    it("returns batchItemFailures if errors are encountered during output", async () => {
      mockStoreFunction2.mockImplementation(
        async () => await Promise.reject(new Error("badness 10000"))
      );

      const { batchItemFailures } = await buildHandler(testOptions)(
        jest.fn(async ({ messages }) => {
          return messages;
        })
      )(testSQSEvent);

      expect(batchItemFailures).toEqual(["msg_1"]);
    });
  });
});
