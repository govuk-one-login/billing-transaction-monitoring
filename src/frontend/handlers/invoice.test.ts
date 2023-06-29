import supertest from "supertest";
import { app } from "../app";
import { makeCtxConfig } from "../../handler-context/context-builder";
import { initApp } from "../init-app";

jest.mock("../../handler-context/context-builder");
const mockedMakeCtxConfig = makeCtxConfig as jest.Mock;

describe("invoice handler", () => {
  let givenContractsConfig;
  let givenServicesConfig;
  let contractId: string;

  beforeEach(() => {
    initApp(app);

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
  });

  test("Page displays invoice info", async () => {
    const request = supertest(app);
    const response = await request.get(
      "/invoice?contract_id=1&year=2023&month=03"
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Home");
    expect(response.text).toContain("Contracts");
    expect(response.text).toContain("C01234 - Vendor One");
    expect(response.text).toMatchSnapshot();
  });
});
