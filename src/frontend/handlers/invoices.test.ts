import supertest from "supertest";
import { app } from "../app";
import { makeCtxConfig } from "../../handler-context/context-builder";
import { initApp } from "../init-app";
import { fetchS3 } from "../../shared/utils";

jest.mock("../../handler-context/context-builder");
const mockedMakeCtxConfig = makeCtxConfig as jest.Mock;

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("invoices handler", () => {
  let givenContractsConfig;
  let givenServicesConfig;
  let givenExtractResults;
  let contractId: string;

  beforeEach(() => {
    initApp(app);

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

    givenExtractResults =
      '{"month":"10","year":"2023","contract_id":"1"}\n' +
      '{"month":"03","year":"2023","contract_id":"1"}\n' +
      '{"month":"04","year":"2023","contract_id":"1"}';
    mockedFetchS3.mockResolvedValue(givenExtractResults);
  });

  test("Page displays months and years of invoices", async () => {
    const request = supertest(app);
    const response = await request.get("/contracts/invoices?contract_id=1");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Home");
    expect(response.text).toContain("Contracts");
    expect(response.text).toContain("C01234 - Vendor One");
    expect(response.text).toContain("Mar 2023");
    expect(response.text).toContain("Apr 2023");
    expect(response.text).toContain("Oct 2023");
    expect(response.text).not.toContain("May 2023");
    expect(response.text).toMatchSnapshot();
  });
});
