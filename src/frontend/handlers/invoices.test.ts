import supertest from "supertest";
import { app } from "../app";
import { makeCtxConfig } from "../../handler-context/context-builder";
import { AthenaQueryExecutor } from "../../shared/utils/athenaV3";
import { initApp } from "../init-app";

jest.mock("../../handler-context/context-builder");
const mockedMakeCtxConfig = makeCtxConfig as jest.Mock;

jest.mock("../../shared/utils/athenaV3");
const MockedAthenaQueryExecutor = AthenaQueryExecutor as jest.MockedClass<
  typeof AthenaQueryExecutor
>;
const mockedAthenaQueryExecutorFetchResults = jest.fn();
MockedAthenaQueryExecutor.mockReturnValue({
  fetchResults: mockedAthenaQueryExecutorFetchResults,
} as any);

describe("invoices handler", () => {
  let givenContractsConfig;
  let givenServicesConfig;
  let givenQueryResults;
  let contractId: string;

  beforeEach(() => {
    initApp(app);

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
  test("Page displays months and years of invoices", async () => {
    const request = supertest(app);
    const response = await request.get("/invoices?contract_id=1");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Mar 2023");

    expect(response.text).toMatchSnapshot();
  });
});
// mock data sources for config bucket and athena
// when visiting /invoices?contract_id=1
// expect to see the months years that i'd expect to see for contract_id 1
