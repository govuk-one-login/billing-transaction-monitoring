import { Logger } from "@aws-lambda-powertools/logger";
import { S3Event, SQSEvent } from "aws-lambda";
import { buildContext } from ".";
import { CtxBuilderOptions } from "..";
import { ConfigFileNames } from "../Config/types";

jest.mock("../S3ConfigClient", () => ({
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

jest.mock("../../shared/utils/s3", () => ({
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

const mockStoreFunction1 = jest.fn();
const mockStoreFunction2 = jest.fn();

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

describe("buildContext", () => {
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
      expectedMessages: [{ a: "something", b: 12, c: false, _id: "msg_1" }],
    },
    { event: testS3Event, expectedMessages: ["test document"] },
  ])(
    "Returns a complete handler context based on the given options and event",
    async ({ event, expectedMessages }) => {
      const ctx = await buildContext<TestMessage, TestEnvVars, TestConfigFiles>(
        event,
        testOptions
      );
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      expect(ctx.logger).toBeInstanceOf(Logger);
      expect(ctx.env).toEqual({
        THIS: "this",
        THAT: "that",
        THE_OTHER: "the other",
      });
      expect(ctx.messages).toEqual(expectedMessages);
      expect(ctx.outputs[0].destination).toBe("that");
      expect(ctx.outputs[1].destination).toBe("the other");
      expect(ctx.config).toEqual({
        inferences: "mock inferences",
        rates: "mock rates",
      });
    }
  );

  it("Throws an error if any of the requested env vars are not present", async () => {
    delete process.env.THE_OTHER;
    try {
      await buildContext<TestMessage, TestEnvVars, TestConfigFiles>(
        testSQSEvent,
        testOptions
      );
    } catch (error) {
      expect((error as Error).message).toContain("Environment is not valid");
    }
    expect.hasAssertions();
  });

  it("Throws an error if a given message does not conform to the specified type", async () => {
    try {
      await buildContext<TestMessage, TestEnvVars, TestConfigFiles>(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {
          ...testSQSEvent,
          Records: [
            ...testSQSEvent.Records,
            {
              messageId: "msg_2",
              body: `{"doesn't": "conform"}`,
            },
          ],
        } as SQSEvent,
        testOptions
      );
    } catch (error) {
      expect((error as Error).message).toContain(
        "Could not process message msg_2"
      );
    }
    expect.hasAssertions();
  });

  it("Throws an error if a given SQS message's body is not valid json", async () => {
    try {
      await buildContext<TestMessage, TestEnvVars, TestConfigFiles>(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {
          ...testSQSEvent,
          Records: [
            ...testSQSEvent.Records,
            {
              messageId: "msg_2",
              body: `"invalid": "json"`,
            },
          ],
        } as SQSEvent,
        testOptions
      );
    } catch (error) {
      expect((error as Error).message).toContain(
        "Could not process message msg_2"
      );
    }
    expect.hasAssertions();
  });

  it("Throws an error if a the file related to a given S3 message cannot be found", async () => {
    try {
      await buildContext<TestMessage, TestEnvVars, TestConfigFiles>(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {
          ...testS3Event,
          Records: [
            ...testS3Event.Records,
            {
              s3: {
                bucket: { name: "test-bucket" },
                object: { key: "dud-key" },
              },
            },
          ],
        } as S3Event,
        testOptions
      );
    } catch (error) {
      expect((error as Error).message).toContain(
        "The document this event pertains to could not be found"
      );
    }
    expect.hasAssertions();
  });

  it("Throws an error if the event type cannot be determined", async () => {
    try {
      await buildContext<TestMessage, TestEnvVars, TestConfigFiles>(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {
          Records: [{ something: "something" }],
        } as unknown as S3Event,
        testOptions
      );
    } catch (error) {
      expect((error as Error).message).toContain(
        "Event type could not be determined"
      );
    }
    expect.hasAssertions();
  });
});
