import { fetchVendorId } from "./fetch-vendor-id";

jest.mock("./fetch-vendor-service-config", () => ({
  fetchVendorServiceConfig: () => [
    {
      vendor_name: "Vendor One",
      vendor_id: "vendor_testvendor1",
      service_name: "Passport check",
      service_regex: "Passport.*check",
      event_name: "VENDOR_1_EVENT_1",
    },
    {
      vendor_name: "Vendor Two",
      vendor_id: "vendor_testvendor2",
      service_name: "Kbv check",
      service_regex: "Kbv.*check",
      event_name: "VENDOR_2_EVENT_7",
    },
  ],
}));

describe("fetchVendorId", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV, CONFIG_BUCKET: "given config bucket" };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("returns a vendor_id if the event name is found in the config bucket", async () => {
    const response = await fetchVendorId("VENDOR_1_EVENT_1");
    expect(response).toEqual("vendor_testvendor1");
  });

  it("throws an error if the event name is not found in the config bucket", async () => {
    await expect(fetchVendorId("SOME_EVENT")).rejects.toThrowError(
      "Event name: SOME_EVENT not found in vendorServiceConfig"
    );
  });

  describe("When no config bucket is configured", () => {
    it("Throws an error", async () => {
      delete process.env.CONFIG_BUCKET;
      await expect(fetchVendorId("VENDOR_1_EVENT_1")).rejects.toThrowError(
        "No CONFIG_BUCKET defined in this environment"
      );
    });
  });
});
