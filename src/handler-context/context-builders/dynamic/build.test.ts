import { Logger } from "@aws-lambda-powertools/logger";
import { SQSEvent, S3Event } from "aws-lambda";
import { CtxBuilderOptions } from "../..";
import { ConfigFileNames } from "../../config/types";
import { StaticHandlerCtxElements } from "../static/build";
import { build } from "./build";

jest.mock("../../../shared/utils", () => ({
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

const testSQSEvent = {
  Records: [
    {
      messageId: "msg_1",
      body: '{"a":"something","b":12,"c":false}',
    },
  ],
} as unknown as SQSEvent;

const testS3Event = {
  Records: [
    {
      s3: {
        bucket: { name: "test-bucket" },
        object: { key: "test-key" },
      },
    },
  ],
} as unknown as S3Event;

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

const testStaticContext = {
  logger: new Logger(),
} as unknown as StaticHandlerCtxElements<TestEnvVars, TestConfigFiles>;

describe("build", () => {
  it.each([
    {
      event: testSQSEvent,
      expectedMessages: [{ a: "something", b: 12, c: false, _id: "msg_1" }],
    },
    { event: testS3Event, expectedMessages: ["test document"] },
  ])(
    "builds context elements which depend on events",
    async ({ event, expectedMessages }) => {
      const ctx = await build<TestMessage, TestEnvVars, TestConfigFiles>(
        event,
        testOptions,
        testStaticContext
      );
      expect(ctx.messages).toEqual(expectedMessages);
    }
  );

  it("Throws an error if a given message does not conform to the specified type", async () => {
    try {
      await build<TestMessage, TestEnvVars, TestConfigFiles>(
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
        testOptions,
        testStaticContext
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
      await build<TestMessage, TestEnvVars, TestConfigFiles>(
        {
          ...testSQSEvent,
          Records: [
            ...testSQSEvent.Records,
            {
              messageId: "msg_2",
              body: `"invalid": "json"`,
            },
          ],
        } as unknown as SQSEvent,
        testOptions,
        testStaticContext
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
      await build<TestMessage, TestEnvVars, TestConfigFiles>(
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
        } as unknown as S3Event,
        testOptions,
        testStaticContext
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
      await build<TestMessage, TestEnvVars, TestConfigFiles>(
        {
          Records: [{ something: "something" }],
        } as unknown as S3Event,
        testOptions,
        testStaticContext
      );
    } catch (error) {
      expect((error as Error).message).toContain(
        "Event type could not be determined"
      );
    }
    expect.hasAssertions();
  });
});
