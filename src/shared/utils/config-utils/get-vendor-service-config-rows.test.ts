import { getVendorServiceConfigRows } from "./get-vendor-service-config-rows";

jest.mock("../s3", () => ({
  ...jest.requireActual("../s3"),
  fetchS3: async () => {
    return `vendor_name,vendor_regex,vendor_id,service_name,service_regex,event_name
    Vendor One,Vendor.*[One|1],vendor_testvendor1,Passport check,Passport.*check,EVENT_1
    Vendor One,Vendor.*[One|1],vendor_testvendor1,Fraud check,Fraud.*check,EVENT_3
    Vendor Two,Vendor.*[Two|2],vendor_testvendor2,Passport check,Passport.*check,EVENT_1
    Vendor Two,Vendor.*[Two|2],vendor_testvendor2,Kbv check,Kbv.*check,EVENT_7
    Vendor Three,Vendor.*[Three|3],vendor_testvendor3,Passport check,Passport.*check,EVENT_1
    Vendor Three,Vendor.*[Three|3],vendor_testvendor3,Address check,Address.*check,EVENT_6
    Vendor Four,Vendor.*[Four|4],vendor_testvendor4,Passport check,Passport.*check,EVENT_1`;
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
          vendor_regex: "Vendor.*[Three|3]",
          vendor_id: "vendor_testvendor3",
          service_name: "Passport check",
          service_regex: "Passport.*check",
          event_name: "EVENT_1",
        },
        {
          vendor_name: "Vendor Three",
          vendor_regex: "Vendor.*[Three|3]",
          vendor_id: "vendor_testvendor3",
          service_name: "Address check",
          service_regex: "Address.*check",
          event_name: "EVENT_6",
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
