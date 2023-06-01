import { fetchEventNames } from "./fetch-event-names";

jest.mock("./fetch-vendor-service-config", () => ({
  fetchVendorServiceConfig: () => [
    { event_name: "BOUGHT_EGGS" },
    { event_name: "MADE_CAKE" },
    { event_name: "ATE_CAKE" },
    { event_name: "MADE_CAKE" },
    { event_name: "MADE_TEA" },
    { event_name: "ATE_CAKE" },
  ],
}));

describe("fetchEventNames", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV, CONFIG_BUCKET: "given config bucket" };
    process.env.OUTPUT_QUEUE_URL = "output-queue-url";
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("returns a set of event names from the config bucket", async () => {
    const response = await fetchEventNames();
    expect(response).toEqual(
      new Set(["BOUGHT_EGGS", "MADE_CAKE", "MADE_TEA", "ATE_CAKE"])
    );
  });

  describe("When no config bucket is configured", () => {
    it("Throws and error", async () => {
      delete process.env.CONFIG_BUCKET;
      await expect(fetchEventNames()).rejects.toThrowError(
        "No CONFIG_BUCKET defined in this environment"
      );
    });
  });
});
