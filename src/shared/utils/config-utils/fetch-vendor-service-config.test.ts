import { fetchS3 } from "../s3";
import { fetchVendorServiceConfig } from "./fetch-vendor-service-config";

jest.mock("../s3");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("fetchVendorServiceConfig", () => {
  it("Returns the vendor service config as json", async () => {
    mockedFetchS3.mockReturnValueOnce(
      "vendor_name,vendor_regex,client_id,service_name,service_regex,event_name\nBilly Mitchell LLC,billy mitchell,vendor_billy,Lying About Speedruns,lying about speedruns,donkey_kong\nNito's Bone Zone,bone zone,vendor_nito,Sword dances,sword dance,sword_dance"
    );
    const vendorServiceConfig = await fetchVendorServiceConfig("bucket");
    expect(vendorServiceConfig).toEqual([
      {
        vendor_name: "Billy Mitchell LLC",
        vendor_regex: "billy mitchell",
        client_id: "vendor_billy",
        service_name: "Lying About Speedruns",
        service_regex: "lying about speedruns",
        event_name: "donkey_kong",
      },
      {
        vendor_name: "Nito's Bone Zone",
        vendor_regex: "bone zone",
        client_id: "vendor_nito",
        service_name: "Sword dances",
        service_regex: "sword dance",
        event_name: "sword_dance",
      },
    ]);
  });
  describe("If vendor service config is not valid", () => {
    it("Throws an error", async () => {
      mockedFetchS3.mockReturnValueOnce(
        "vendor_name,vendor_regex,client_id,service_shame,service_regex,event_name\nBilly Mitchell LLC,billy mitchell,vendor_billy,Lying About Speedruns,lying about speedruns,donkey_kong\nNito's Bone Zone,bone zone,vendor_nito,Sword dances,sword dance,sword_dance"
      );
      try {
        await fetchVendorServiceConfig("bucket");
      } catch (error) {
        expect((error as Error).message).toBe("Invalid vendor service config");
      }
      expect.hasAssertions();
    });
  });
});
