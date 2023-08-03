import { ConfigElements } from "../../shared/constants";
import { getConfig } from "../../shared/utils";
import { getContractIds } from "./get-contract-ids";

jest.mock("../../shared/utils");
const mockedGetConfig = getConfig as jest.Mock;

describe("getContractIds", () => {
  let givenContractsConfig: any;
  let givenServicesConfig: any;
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
    mockedGetConfig.mockImplementation((fileName) =>
      fileName === ConfigElements.services
        ? givenServicesConfig
        : givenContractsConfig
    );
  });

  test("should return the contracts id, contracts name and the vendor name", async () => {
    // Act
    const result = await getContractIds();
    // Assert
    expect(result).toEqual(["1"]);
  });
});
