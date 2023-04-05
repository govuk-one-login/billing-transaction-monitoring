import { Logger } from "@aws-lambda-powertools/logger";
import { SQSEvent, S3Event } from "aws-lambda";
import { CtxBuilderOptions } from "../..";
import { ConfigElements } from "../../config/types";
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
type TestConfigCache = ConfigElements.inferences | ConfigElements.rates;

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
  TestConfigCache
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
  ConfigCache: [ConfigElements.inferences, ConfigElements.rates],
};

const testStaticContext = {
  logger: new Logger(),
} as unknown as StaticHandlerCtxElements<TestEnvVars, TestConfigCache>;

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
      const ctx = await build<TestMessage, TestEnvVars, TestConfigCache>(
        event,
        testOptions,
        testStaticContext
      );
      expect(ctx.messages).toEqual(expectedMessages);
    }
  );

  it("Throws an error if a given message does not conform to the specified type", async () => {
    try {
      await build<TestMessage, TestEnvVars, TestConfigCache>(
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
        "Message msg_2 did not conform to the expected type"
      );
    }
    expect.hasAssertions();
  });

  it("Throws an error if a given SQS message's body is not valid json", async () => {
    try {
      await build<TestMessage, TestEnvVars, TestConfigCache>(
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
        "Failed to parse message msg_2 as JSON"
      );
    }
    expect.hasAssertions();
  });

  it("Throws an error if the S3-object the message references cannot not be found", async () => {
    try {
      await build<TestMessage, TestEnvVars, TestConfigCache>(
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
        "The object this event references could not be found."
      );
    }
    expect.hasAssertions();
  });

  it("Throws an error if the event type cannot be determined", async () => {
    try {
      await build<TestMessage, TestEnvVars, TestConfigCache>(
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
