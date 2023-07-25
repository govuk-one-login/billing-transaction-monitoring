import { Logger } from "@aws-lambda-powertools/logger";
import { ConfigElements } from "../../shared/constants";
import { HandlerOptions } from "../types";
import { buildContext } from "./build";
import { getFromEnv } from "../../shared/utils/env";

jest.mock("../../shared/utils/config-utils/s3-config-client");

jest.mock("../../shared/utils/env");
const mockedGetFromEnv = getFromEnv as jest.Mock;

interface TestMessage {
  a: string;
  b: number;
  c: boolean;
}

describe("buildContext", () => {
  let mockedEnv: Partial<Record<string, string>>;
  let mockStoreFunction1: jest.Mock;
  let mockStoreFunction2: jest.Mock;
  let testLogger: Logger;
  let testOptions: HandlerOptions<any, any, any, any>;

  beforeEach(() => {
    mockedEnv = {
      THIS: "this",
      THAT: "that",
      THE_OTHER: "the other",
      CONFIG_BUCKET: "mock-config-bucket",
    };

    mockedGetFromEnv.mockImplementation((key) => mockedEnv[key]);

    mockStoreFunction1 = jest.fn();
    mockStoreFunction2 = jest.fn();

    testLogger = { error: jest.fn() } as any;

    testOptions = {
      envVars: ["THIS", "THAT", "THE_OTHER"],
      incomingMessageBodyTypeGuard: (
        messageBody: any
      ): messageBody is TestMessage =>
        typeof messageBody.a === "string" &&
        typeof messageBody.b === "number" &&
        typeof messageBody.c === "boolean",
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
    } as any;
  });

  it("builds context elements which don't depend on events", async () => {
    const ctx = await buildContext(testLogger, testOptions);
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
    delete mockedEnv.THE_OTHER;
    try {
      await buildContext(testLogger, testOptions);
    } catch (error) {
      expect((error as Error).message).toContain("Environment is not valid");
    }
    expect.hasAssertions();
  });
});
