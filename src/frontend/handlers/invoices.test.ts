import supertest from "supertest";
import { ConfigElements } from "../../shared/constants";
import { fetchS3, getConfig } from "../../shared/utils";
import { app } from "../app";
import { initApp } from "../init-app";
import { unitTestMiddleware } from "../middleware";

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;
const mockedGetConfig = getConfig as jest.Mock;

describe("invoices handler", () => {
  let givenContractsConfig: any;
  let givenServicesConfig: any;
  let contractId: string;

  beforeEach(() => {
    initApp(app, unitTestMiddleware);

    process.env = {
      STORAGE_BUCKET: "given storage bucket",
    };

    mockedFetchS3.mockResolvedValue(`{ "vendor_id": "vendor_testvendor1", "vendor_name": "Vendor One", "contract_id": "1", "contract_name": "C01234", "year": "2023", "month": "03" }
{ "vendor_id": "vendor_testvendor1", "vendor_name": "Vendor One", "contract_id": "1", "contract_name": "C01234", "year": "2023", "month": "04" }
{ "vendor_id": "vendor_testvendor1", "vendor_name": "Vendor One", "contract_id": "1", "contract_name": "C01234", "year": "2023", "month": "10" }`);

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

  test("Page displays months and years of invoices", async () => {
    const request = supertest(app);
    const response = await request.get(`/contracts/${contractId}/invoices`);
    expect(response.status).toBe(200);
    expect(response.text).toContain("Billings and reconciliation");
    expect(response.text).toContain("Contracts");
    expect(response.text).toContain("C01234 - Vendor One");
    expect(response.text).toContain("Mar 2023");
    expect(response.text).toContain("Apr 2023");
    expect(response.text).toContain("Oct 2023");
    expect(response.text).not.toContain("May 2023");
    expect(response.text).toMatchSnapshot();
  });
});
