import { Logger } from "@aws-lambda-powertools/logger";
import { Config, ConfigClient, ConfigFileNames } from "./Config";

const mockClient: ConfigClient = {
  getConfigFile: jest.fn(async (path) => {
    switch (path) {
      case ConfigFileNames.inferences:
        return "mock inferences";
      case ConfigFileNames.rates:
        return "mock rates";
      case ConfigFileNames.standardisation:
        return "mock standardisation";
      default:
        throw new Error("You requested path");
    }
  }),
};

const logger = new Logger();
const spiedOnWarn = jest.spyOn(logger, "warn");

describe("Config", () => {
  beforeEach(() => {
    process.env.CONFIG_BUCKET = "mock-config-bucket";
    jest.clearAllMocks();
  });
  afterAll(() => {
    delete process.env.CONFIG_BUCKET;
  });
  it("Provides a cached copy of the specified config files", async () => {
    const config = new Config(
      mockClient,
      [
        ConfigFileNames.inferences,
        ConfigFileNames.rates,
        ConfigFileNames.standardisation,
      ],
      logger
    );

    await config.populateCache();

    expect(config.getCache().inferences).toBe("mock inferences");
    expect(config.getCache().rates).toBe("mock rates");
    expect(config.getCache().standardisation).toBe("mock standardisation");

    expect(mockClient.getConfigFile).toHaveBeenCalledTimes(3);
  });

  it("Doesn't cache files you didn't ask for", async () => {
    const config = new Config(
      mockClient,
      [ConfigFileNames.inferences, ConfigFileNames.rates],
      logger
    );

    await config.populateCache();

    expect(config.getCache().inferences).toBe("mock inferences");
    expect(config.getCache().rates).toBe("mock rates");
    // @ts-expect-error
    expect(config.getCache().standardisation).toBe(undefined);

    expect(mockClient.getConfigFile).toHaveBeenCalledTimes(2);
  });

  it("Issues a warning when the cache is requested before it is awaited", () => {
    const config = new Config(
      mockClient,
      [
        ConfigFileNames.inferences,
        ConfigFileNames.rates,
        ConfigFileNames.standardisation,
      ],
      logger
    );

    config.getCache();

    expect(spiedOnWarn).toHaveBeenCalledWith(
      expect.stringMatching("Called getCache before awaiting populateCache")
    );
  });

  it("Throws an error when there is no CONFIG_BUCKET env var", () => {
    delete process.env.CONFIG_BUCKET;
    try {
      const _config = new Config(
        mockClient,
        [
          ConfigFileNames.inferences,
          ConfigFileNames.rates,
          ConfigFileNames.standardisation,
        ],
        logger
      );
    } catch (error) {
      expect((error as Error).message).toContain("CONFIG_BUCKET");
    }
    expect.hasAssertions();
  });

  it("Throws an error when config files are not fetched successfully", async () => {
    (mockClient.getConfigFile as jest.Mock).mockRejectedValueOnce(
      "underlying badness"
    );
    const config = new Config(
      mockClient,
      [
        ConfigFileNames.inferences,
        ConfigFileNames.rates,
        ConfigFileNames.standardisation,
      ],
      logger
    );
    try {
      await config.populateCache();
    } catch (error) {
      expect((error as Error).message).toContain("underlying badness");
    }
  });
});
