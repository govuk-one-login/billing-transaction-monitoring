import { makeCtxConfig } from "../handler-context/context-builder";
import {
  getContractAndVendorName,
  getContractPeriods,
  getContracts,
} from "./config";
import { AthenaQueryExecutor } from "../shared/utils/athenaV3";

jest.mock("../handler-context/context-builder");
const mockedMakeCtxConfig = makeCtxConfig as jest.Mock;

jest.mock("../shared/utils/athenaV3");
const MockedAthenaQueryExecutor = AthenaQueryExecutor as jest.MockedClass<
  typeof AthenaQueryExecutor
>;
const mockedAthenaQueryExecutorFetchResults = jest.fn();
MockedAthenaQueryExecutor.mockReturnValue({
  fetchResults: mockedAthenaQueryExecutorFetchResults,
} as any);
describe("frontend config", () => {
  let givenContractsConfig;
  let givenServicesConfig;
  let givenQueryResults;
  let contractId: string;

  beforeEach(() => {
    process.env = {
      QUERY_RESULTS_BUCKET: "given query results bucket",
      DATABASE_NAME: "given database name",
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

    givenQueryResults = {
      ColumnInfos: [],
      ResultRows: [],
      ResultSetMetadata: { ColumnInfo: [] },
      Rows: [
        { Data: [{ VarCharValue: "month" }, { VarCharValue: "year" }] },
        { Data: [{ VarCharValue: "03" }, { VarCharValue: "2023" }] },
      ],
    };
    mockedAthenaQueryExecutorFetchResults.mockResolvedValue(givenQueryResults);
  });
  describe("getContracts", () => {
    test("should return the contracts id, contracts name and the vendor name", async () => {
      // Act
      const result = await getContracts();
      // Assert
      expect(result).toEqual([
        { id: "1", name: "C01234", vendorName: "Vendor One" },
      ]);
    });
  });

  describe("getContractAndVendorName", () => {
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

  describe("getContractPeriods", () => {
    test("should return the month, year and prettyMonth", async () => {
      // Act
      const result = await getContractPeriods(contractId);
      // Assert
      expect(result).toEqual([
        { month: "03", prettyMonth: "Mar", year: "2023" },
      ]);
    });
    test("should throw an error if there is no QUERY_RESULTS_BUCKET", async () => {
      // Act
      delete process.env.QUERY_RESULTS_BUCKET;
      // Assert
      await expect(getContractPeriods(contractId)).rejects.toThrowError(
        "No QUERY_RESULTS_BUCKET defined in this environment"
      );
    });
    test("should throw an error if there is no DATABASE_NAME", async () => {
      // Act
      delete process.env.DATABASE_NAME;
      // Assert
      await expect(getContractPeriods(contractId)).rejects.toThrowError(
        "No DATABASE_NAME defined in this environment"
      );
    });
    test("should throw an error if there are no results in result set", async () => {
      // Act
      mockedAthenaQueryExecutorFetchResults.mockResolvedValue({});
      // Assert
      await expect(getContractPeriods(contractId)).rejects.toThrowError(
        "No results in result set"
      );
    });
    test("should throw an error if there is data missing", async () => {
      // Act
      mockedAthenaQueryExecutorFetchResults.mockResolvedValue({
        ColumnInfos: [],
        ResultRows: [],
        ResultSetMetadata: { ColumnInfo: [] },
        Rows: [
          { Data: [{ VarCharValue: "month" }, { VarCharValue: "year" }] },
          { Data: [{ VarCharValue: "03" }, {}] }, // Missing year
        ],
      });
      // Assert
      await expect(getContractPeriods(contractId)).rejects.toThrowError(
        "Some data was missing"
      );
    });
  });
});
