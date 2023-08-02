import supertest from "supertest";
import { ConfigElements } from "../../shared/constants";
import { fetchS3, getConfig, getFromEnv } from "../../shared/utils";
import { app } from "../app";
import { initApp } from "../init-app";
import { statusLabels } from "../utils";
import { unitTestMiddleware } from "../middleware";

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;
const mockedGetConfig = getConfig as jest.Mock;
const mockedGetFromEnv = getFromEnv as jest.Mock;

jest.mock("../utils/should-load-from-node-modules", () => ({
  shouldLoadFromNodeModules: true,
}));

describe("invoice handler", () => {
  let givenContractsConfig: any;
  let givenServicesConfig: any;
  let givenExtractResults;

  beforeEach(() => {
    initApp(app, unitTestMiddleware);

    mockedGetFromEnv.mockImplementation((key) =>
      key === "STORAGE_BUCKET" ? "given storage bucket" : undefined
    );

    givenContractsConfig = [
      { id: "1", name: "C01234", vendor_id: "vendor_testvendor1" },
    ];
    givenServicesConfig = [
      {
        vendor_name: "Vendor One",
        vendor_id: "vendor_testvendor1",
        service_name: "Passport check",
        service_regex: "Passport.*check",
        event_name: "VENDOR_1_EVENT_1",
        contract_id: "1",
      },
      {
        vendor_name: "Vendor One",
        vendor_id: "vendor_testvendor1",
        service_name: "ABC Charge",
        service_regex: "ABC.*Charge",
        event_name: "VENDOR_1_EVENT_2",
        contract_id: "1",
      },
    ];

    mockedGetConfig.mockImplementation((fileName) =>
      fileName === ConfigElements.services
        ? givenServicesConfig
        : givenContractsConfig
    );
  });

  test("Page displays Invoice above threshold banner text and three line items in the Reconciliation Table for Mar 2023", async () => {
    // The single line item that's over threshold should cause the error banner
    // even though the other line items are within or below threshold.
    givenExtractResults = `{"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"Passport check","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"293.19","transaction_price_formatted":"266.82","price_difference":"26.37","billing_quantity":"73298", "transaction_quantity":"66706", "quantity_difference":"6,592.00","billing_amount_with_tax":"351.83","price_difference_percentage":"9.8814"}
    {"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"Passport check","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"3,850.16","transaction_price_formatted":"3,854.92","price_difference":"-4.76","billing_quantity":"11324", "transaction_quantity":"11338", "quantity_difference":"-14","billing_amount_with_tax":"4,620.19","price_difference_percentage":"-1.1235"}
    {"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"Passport check","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"100","transaction_price_formatted":"100","price_difference":"0.00","billing_quantity":"100", "transaction_quantity":"100", "quantity_difference":"100.00","billing_amount_with_tax":"110","price_difference_percentage":"0"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get("/contracts/1/invoices/2023-03");
    expect(response.status).toBe(200);
    expect(response.text).toContain(
      "C01234 - Vendor One Mar 2023 reconciliation"
    ); // page heading
    expect(response.text).toContain("Invoice above threshold"); // banner
    expect(response.text).toContain("9.8814"); // percentage discrepancy in table
    expect(response.text).toContain(
      statusLabels.STATUS_LABEL_ABOVE_THRESHOLD.message
    ); // status in table for Above Threshold
    expect(response.text).toContain("-1.1235"); // percentage discrepancy in table
    expect(response.text).toContain(
      statusLabels.STATUS_LABEL_BELOW_THRESHOLD.message
    ); // status in table for Below Threshold
    expect(response.text).toContain("0"); // percentage discrepancy in table
    expect(response.text).toContain(
      statusLabels.STATUS_LABEL_WITHIN_THRESHOLD.message
    ); // status in table for Within Threshold
    expect(response.text).toMatchSnapshot();
  });
});
