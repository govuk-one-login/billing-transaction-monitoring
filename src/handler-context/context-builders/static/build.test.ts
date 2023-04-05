import { Logger } from "@aws-lambda-powertools/logger";
import { CtxBuilderOptions } from "../..";
import { ConfigElements } from "../../config/types";
import { build } from "./build";

jest.mock("../../config/s3-config-client");

interface TestMessage {
  a: string;
  b: number;
  c: boolean;
}
type TestEnvVars = "THIS" | "THAT" | "THE_OTHER";
type TestConfigCache = ConfigElements.inferences | ConfigElements.rates;

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

describe("build", () => {
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

  it("builds context elements which don't depend on events", async () => {
    const ctx = await build<TestMessage, TestEnvVars, TestConfigCache>(
      testOptions
    );
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    expect(ctx.logger).toBeInstanceOf(Logger);
    expect(ctx.env).toEqual({
      THIS: "this",
      THAT: "that",
      THE_OTHER: "the other",
    });
    expect(ctx.outputs[0].destination).toBe("that");
    expect(ctx.outputs[1].destination).toBe("the other");
    expect(ctx.config).toEqual({
      inferences: "mock inferences",
      rates: "mock rates",
    });
  });

  it("Throws an error if any of the requested env vars are not present", async () => {
    delete process.env.THE_OTHER;
    try {
      await build<TestMessage, TestEnvVars, TestConfigCache>(testOptions);
    } catch (error) {
      expect((error as Error).message).toContain("Environment is not valid");
    }
    expect.hasAssertions();
  });
});
