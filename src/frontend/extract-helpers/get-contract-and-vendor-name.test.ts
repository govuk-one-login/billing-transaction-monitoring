import { getConfig } from "../../shared/utils";
import { getContractAndVendorName } from "./get-contract-and-vendor-name";

jest.mock("../../shared/utils");
const mockedGetConfig = getConfig as jest.Mock;

describe("getContractAndVendorName", () => {
  let givenContractsConfig;
  let givenServicesConfig;
  let contractId: string;

  beforeEach(() => {
    process.env = {
      STORAGE_BUCKET: "given storage bucket",
    };

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
    mockedGetConfig
      .mockResolvedValueOnce(givenServicesConfig)
      .mockResolvedValueOnce(givenContractsConfig);
  });

  test("should return the contract name and the vendor name", async () => {
    // Act
    const result = await getContractAndVendorName(contractId);
    // Assert
    expect(result).toEqual({
      contractName: "C01234",
      vendorName: "Vendor One",
    });
  });

  test("should throw an error if there is no contract for the given contract id", async () => {
    // Act & Assert
    await expect(getContractAndVendorName("2")).rejects.toThrowError(
      "No contract found"
    );
  });
});
