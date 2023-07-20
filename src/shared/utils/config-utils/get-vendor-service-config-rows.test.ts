import { getVendorServiceConfigRows } from "./get-vendor-service-config-rows";

jest.mock("./get-config", () => ({
  getConfig: async () => [
    {
      vendor_name: "Vendor One",
      vendor_id: "vendor_testvendor1",
      service_name: "Passport check",
      service_regex: "Passport.*check",
      event_name: "EVENT_1",
      contract_id: "1",
    },
    {
      vendor_name: "Vendor One",
      vendor_id: "vendor_testvendor1",
      service_name: "Fraud check",
      service_regex: "Fraud.*check",
      event_name: "EVENT_3",
      contract_id: "1",
    },
    {
      vendor_name: "Vendor Two",
      vendor_id: "vendor_testvendor2",
      service_name: "Passport check",
      service_regex: "Passport.*check",
      event_name: "EVENT_1",
      contract_id: "2",
    },
    {
      vendor_name: "Vendor Two",
      vendor_id: "vendor_testvendor2",
      service_name: "Kbv check",
      service_regex: "Kbv.*check",
      event_name: "EVENT_7",
      contract_id: "2",
    },
    {
      vendor_name: "Vendor Three",
      vendor_id: "vendor_testvendor3",
      service_name: "Passport check",
      service_regex: "Passport.*check",
      event_name: "EVENT_1",
      contract_id: "3",
    },
    {
      vendor_name: "Vendor Three",
      vendor_id: "vendor_testvendor3",
      service_name: "Address check",
      service_regex: "Address.*check",
      event_name: "EVENT_6",
      contract_id: "3",
    },
    {
      vendor_name: "Vendor Four",
      vendor_id: "vendor_testvendor4",
      service_name: "Passport check",
      service_regex: "Passport.*check",
      event_name: "EVENT_1",
      contract_id: "4",
    },
  ],
}));

describe("getVendorServiceConfigRows", () => {
  describe("Given fields matching part of the config", () => {
    it("Returns the matching lines", async () => {
      const result = await getVendorServiceConfigRows({
        vendor_id: "vendor_testvendor3",
      });
      expect(result).toEqual([
        {
          vendor_name: "Vendor Three",
          vendor_id: "vendor_testvendor3",
          service_name: "Passport check",
          service_regex: "Passport.*check",
          event_name: "EVENT_1",
          contract_id: "3",
        },
        {
          vendor_name: "Vendor Three",
          vendor_id: "vendor_testvendor3",
          service_name: "Address check",
          service_regex: "Address.*check",
          event_name: "EVENT_6",
          contract_id: "3",
        },
      ]);
    });
  });

  describe("Given fields that don't match the config", () => {
    it("throws an error", async () => {
      try {
        await getVendorServiceConfigRows({
          vendor_id: "vendor_notavendor",
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
      expect.hasAssertions();
    });
  });
});
