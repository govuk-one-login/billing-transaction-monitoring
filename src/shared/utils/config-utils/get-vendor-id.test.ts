import { VendorServiceConfig } from "./fetch-vendor-service-config";
import { getVendorId } from "./get-vendor-id";

describe("getVendorId", () => {
  let givenVendorServiceConfig: VendorServiceConfig;

  beforeEach(() => {
    givenVendorServiceConfig = [
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
    ];
  });

  it("returns a vendor_id if the event name is found in the config", () => {
    const result = getVendorId("VENDOR_1_EVENT_1", givenVendorServiceConfig);
    expect(result).toEqual("vendor_testvendor1");
  });

  it("throws an error if the event name is not found in the config bucket", () => {
    expect(() =>
      getVendorId("SOME_EVENT", givenVendorServiceConfig)
    ).toThrowError("Event name: SOME_EVENT not found in vendorServiceConfig");
  });
});
