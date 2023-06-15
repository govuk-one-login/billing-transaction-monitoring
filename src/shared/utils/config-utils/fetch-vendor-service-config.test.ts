import { fetchS3 } from "../s3";
import { fetchVendorServiceConfig } from "./fetch-vendor-service-config";

jest.mock("../s3");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("fetchVendorServiceConfig", () => {
  it("Returns the vendor service config as json", async () => {
    mockedFetchS3.mockReturnValueOnce(
      "vendor_name,vendor_id,service_name,service_regex,event_name,contract_id\nBilly Mitchell LLC,vendor_billy,Lying About Speedruns,lying about speedruns,donkey_kong,1\nNito's Bone Zone,vendor_nito,Sword dances,sword dance,sword_dance,1"
    );
    const vendorServiceConfig = await fetchVendorServiceConfig("bucket");
    expect(vendorServiceConfig).toEqual([
      {
        vendor_name: "Billy Mitchell LLC",
        vendor_id: "vendor_billy",
        service_name: "Lying About Speedruns",
        service_regex: "lying about speedruns",
        event_name: "donkey_kong",
        contract_id: "1",
      },
      {
        vendor_name: "Nito's Bone Zone",
        vendor_id: "vendor_nito",
        service_name: "Sword dances",
        service_regex: "sword dance",
        event_name: "sword_dance",
        contract_id: "1",
      },
    ]);
  });
  describe("If vendor service config is empty", () => {
    it("Throws an error", async () => {
      mockedFetchS3.mockReturnValueOnce("");
      try {
        await fetchVendorServiceConfig("bucket");
      } catch (error) {
        expect((error as Error).message).toBe("No vendor service config found");
      }
      expect.hasAssertions();
    });
  });

  describe("If vendor service config is not valid", () => {
    it("Throws an error", async () => {
      mockedFetchS3.mockReturnValueOnce(
        "vendor_name,vendor_id,service_shame,service_regex,event_name,contract_id\nBilly Mitchell LLC,vendor_billy,Lying About Speedruns,lying about speedruns,donkey_kong,1\nNito's Bone Zone,vendor_nito,Sword dances,sword dance,sword_dance,1"
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
