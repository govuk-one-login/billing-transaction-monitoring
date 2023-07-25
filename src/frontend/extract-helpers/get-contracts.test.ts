import { ConfigElements } from "../../shared/constants";
import { getConfig, getFromEnv } from "../../shared/utils";
import { getContracts } from "./get-contracts";

jest.mock("../../shared/utils");
const mockedGetConfig = getConfig as jest.Mock;
const mockedGetFromEnv = getFromEnv as jest.Mock;

describe("getContracts", () => {
  let givenContractsConfig: any;
  let givenServicesConfig: any;
  let contractId: string;

  beforeEach(() => {
    mockedGetFromEnv.mockImplementation((key) =>
      key === "STORAGE_BUCKET" ? "given storage bucket" : undefined
    );

    contractId = "1";
    givenContractsConfig = [
      { id: contractId, name: "C01234", vendor_id: "vendor_testvendor1" },
    ];
    givenServicesConfig = [
      {
        vendor_name: "Vendor One",
        vendor_id: "vendor_testvendor1",
        service_name: "Passport check",
        service_regex: "Passport.*check",
        event_name: "VENDOR_1_EVENT_1",
        contract_id: contractId,
      },
    ];
    // Arrange
    mockedGetConfig.mockImplementation((fileName) =>
      fileName === ConfigElements.services
        ? givenServicesConfig
        : givenContractsConfig
    );
  });

  test("should return the contracts id, contracts name and the vendor name", async () => {
    // Act
    const result = await getContracts();
    // Assert
    expect(result).toEqual([
      { id: "1", name: "C01234", vendorName: "Vendor One" },
    ]);
  });
});
