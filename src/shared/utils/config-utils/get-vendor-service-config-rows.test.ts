import { getVendorServiceConfigRows } from "./get-vendor-service-config-rows";

jest.mock("../s3", () => ({
  ...jest.requireActual("../s3"),
  fetchS3: async () => {
    return `vendor_name,vendor_id,service_name,service_regex,event_name,contract_id
    Vendor One,vendor_testvendor1,Passport check,Passport.*check,EVENT_1,1
    Vendor One,vendor_testvendor1,Fraud check,Fraud.*check,EVENT_3,1
    Vendor Two,vendor_testvendor2,Passport check,Passport.*check,EVENT_1,2
    Vendor Two,vendor_testvendor2,Kbv check,Kbv.*check,EVENT_7,2
    Vendor Three,vendor_testvendor3,Passport check,Passport.*check,EVENT_1,3
    Vendor Three,vendor_testvendor3,Address check,Address.*check,EVENT_6,3
    Vendor Four,vendor_testvendor4,Passport check,Passport.*check,EVENT_1,4`;
  },
}));

describe("getVendorServiceConfigRows", () => {
  describe("Given fields matching part of the config", () => {
    it("Returns the matching lines", async () => {
      const result = await getVendorServiceConfigRows("bucket", {
        vendor_id: "vendor_testvendor3",
      });
      expect(result).toEqual([
        {
          vendor_name: "Vendor Three",
          vendor_id: "vendor_testvendor3",
          service_name: "Passport check",
          service_regex: "Passport.*check",
          event_name: "EVENT_1",
          contract_id: "1",
        },
        {
          vendor_name: "Vendor Three",
          vendor_id: "vendor_testvendor3",
          service_name: "Address check",
          service_regex: "Address.*check",
          event_name: "EVENT_6",
          contract_id: "1",
        },
      ]);
    });
  });

  describe("Given fields that don't match the config", () => {
    it("throws an error", async () => {
      try {
        await getVendorServiceConfigRows("bucket", {
          vendor_id: "vendor_notavendor",
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
      expect.hasAssertions();
    });
  });
});
