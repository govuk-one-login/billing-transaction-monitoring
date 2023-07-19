import { makeCtxConfig } from "../../handler-context/context-builder";
import { fetchS3 } from "../../shared/utils";
import { getContracts } from "./get-contracts";

jest.mock("../../handler-context/context-builder");
const mockedMakeCtxConfig = makeCtxConfig as jest.Mock;

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("getContracts", () => {
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
    mockedMakeCtxConfig.mockResolvedValue({
      services: givenServicesConfig,
      contracts: givenContractsConfig,
    });

    mockedFetchS3.mockResolvedValue(
      '{"month":"03","year":"2023","contract_id":"1"}'
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
