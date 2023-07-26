import { ConfigElements } from "../../shared/constants";
import { getConfigFile, getFromEnv } from "../../shared/utils";
import { Config } from ".";

jest.mock("../../shared/utils");
const mockGetConfigFile = getConfigFile as jest.Mock;
const mockedGetFromEnv = getFromEnv as jest.Mock;

describe("Config", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockedGetFromEnv.mockImplementation((key) =>
      key === "CONFIG_BUCKET" ? "mock-config-bucket" : undefined
    );

    mockGetConfigFile.mockImplementation(async (path) => {
      switch (path) {
        case ConfigElements.inferences:
          return "mock inferences";
        case ConfigElements.rates:
          return "mock rates";
        case ConfigElements.standardisation:
          return "mock standardisation";
        default:
          throw new Error("You requested path");
      }
    });
    jest.clearAllMocks();
  });

  it("Provides a cached copy of the specified config files", async () => {
    const config = new Config([
      ConfigElements.inferences,
      ConfigElements.rates,
      ConfigElements.standardisation,
    ]);

    await config.populateCache();

    expect(config.getCache().inferences).toBe("mock inferences");
    expect(config.getCache().rates).toBe("mock rates");
    expect(config.getCache().standardisation).toBe("mock standardisation");

    expect(mockGetConfigFile).toHaveBeenCalledTimes(3);
  });

  it("Doesn't cache files you didn't ask for", async () => {
    const config = new Config([
      ConfigElements.inferences,
      ConfigElements.rates,
    ]);

    await config.populateCache();

    expect(config.getCache().inferences).toBe("mock inferences");
    expect(config.getCache().rates).toBe("mock rates");
    // @ts-expect-error
    expect(config.getCache().standardisation).toBe(undefined);

    expect(mockGetConfigFile).toHaveBeenCalledTimes(2);
  });

  it("Throws an error when the cache is requested before it is awaited", () => {
    const config = new Config([
      ConfigElements.inferences,
      ConfigElements.rates,
      ConfigElements.standardisation,
    ]);

    try {
      config.getCache();
    } catch (error) {
      expect((error as Error).message).toContain(
        "Called getCache before awaiting populateCache"
      );
      expect((error as Error).message).toContain("Ensure");
    }
    expect.hasAssertions();
  });

  it("Throws an error when config files are not fetched successfully", async () => {
    mockGetConfigFile.mockRejectedValueOnce(new Error("underlying badness"));
    const config = new Config([
      ConfigElements.inferences,
      ConfigElements.rates,
      ConfigElements.standardisation,
    ]);
    try {
      await config.populateCache();
    } catch (error) {
      expect((error as Error).message).toContain("underlying badness");
    }
    expect.hasAssertions();
  });
});
