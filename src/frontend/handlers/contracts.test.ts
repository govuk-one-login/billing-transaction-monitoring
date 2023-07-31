import supertest from "supertest";
import { ConfigElements } from "../../shared/constants";
import { getConfig, getFromEnv } from "../../shared/utils";
import { app } from "../app";
import { initApp } from "../init-app";
import { getOverviewRows } from "../extract-helpers";
import { unitTestMiddleware } from "../middleware";

jest.mock("../../shared/utils");
const mockedGetConfig = getConfig as jest.Mock;
const mockedGetFromEnv = getFromEnv as jest.Mock;

jest.mock("../utils/should-load-from-node-modules", () => ({
  shouldLoadFromNodeModules: true,
}));

jest.mock("../extract-helpers/get-overview-rows");
const mockedGetOverviewRows = getOverviewRows as jest.Mock;

describe("contracts handler", () => {
  let givenContractsConfig: any;
  let givenServicesConfig: any;

  beforeEach(() => {
    initApp(app, unitTestMiddleware);
    jest.resetAllMocks();

    mockedGetFromEnv.mockImplementation((key) =>
      key === "STORAGE_BUCKET" ? "given storage bucket" : undefined
    );

    givenContractsConfig = [
      { id: "1", name: "C01234", vendor_id: "vendor_testvendor1" },
      { id: "2", name: "C01235", vendor_id: "vendor_testvendor2" },
    ];
    givenServicesConfig = [
      {
        vendor_name: "Vendor One",
        vendor_id: "vendor_testvendor1",
        service_name: "Some check",
        service_regex: "Some.*check",
        event_name: "VENDOR_1_EVENT_1",
        contract_id: "1",
      },
      {
        vendor_name: "Vendor Two",
        vendor_id: "vendor_testvendor2",
        service_name: "Another check",
        service_regex: "Another.*check",
        event_name: "VENDOR_2_EVENT_2",
        contract_id: "2",
      },
    ];
    // Arrange
    mockedGetOverviewRows.mockResolvedValue([
      {
        contractId: "c1",
        contractName: "C01234",
        vendorName: "Vendor One",
        year: "2023",
        month: "06",
        prettyMonth: "Jun",
        reconciliationDetails: {
          tagClass: "govuk-tag--grey",
          bannerMessage: "Invoice data missing",
        },
        details: "View Invoice",
      },
      {
        contractId: "m2",
        contractName: "MOU",
        vendorName: "Vendor Two",
        year: "2023",
        month: "06",
        prettyMonth: "Jun",
        reconciliationDetails: {
          tagClass: "govuk-tag--green",
          bannerMessage: "Invoice within threshold",
        },
        details: "View Invoice",
      },
    ]);
    mockedGetConfig.mockImplementation((fileName) =>
      fileName === ConfigElements.services
        ? givenServicesConfig
        : givenContractsConfig
    );
  });

  test("Page displays all contracts", async () => {
    const request = supertest(app);
    const response = await request.get("/contracts");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Billings and reconciliation");
    expect(response.text).toContain("Contracts");
    expect(response.text).toContain("C01234 - Vendor One");
    expect(response.text).toContain("C01235 - Vendor Two");
    expect(response.text).toMatchSnapshot();
  });
});
