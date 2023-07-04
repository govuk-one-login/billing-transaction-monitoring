import supertest from "supertest";
import { app } from "../app";
import { makeCtxConfig } from "../../handler-context/context-builder";
import { initApp } from "../init-app";
import { fetchS3 } from "../../shared/utils";
import {
  MN_EVENTS_MISSING,
  MN_INVOICE_MISSING,
  MN_RATES_MISSING,
  MN_UNEXPECTED_CHARGE,
  STATUS_LABEL_ABOVE_THRESHOLD,
  STATUS_LABEL_BELOW_THRESHOLD,
  STATUS_LABEL_ERROR,
  STATUS_LABEL_WITHIN_THRESHOLD,
} from "../frontend-utils";

jest.mock("../../handler-context/context-builder");
const mockedMakeCtxConfig = makeCtxConfig as jest.Mock;

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("invoice handler", () => {
  let givenContractsConfig;
  let givenServicesConfig;
  let givenExtractResults;

  beforeEach(() => {
    initApp(app);

    process.env = {
      STORAGE_BUCKET: "given storage bucket",
    };

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
    mockedMakeCtxConfig.mockResolvedValue({
      services: givenServicesConfig,
      contracts: givenContractsConfig,
    });

    givenExtractResults = `{"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"Passport check","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"£650.00","transaction_price_formatted":"","price_difference":"","billing_quantity":"2", "transaction_quantity":"11", "quantity_difference":"-9","billing_amount_with_tax":"£780.00","price_difference_percentage":"0"}
{"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"Passport check","month":"04","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"16,029.00","transaction_price_formatted":"15,828.30","price_difference":"200.70","billing_quantity":"53430", "transaction_quantity":"52761", "quantity_difference":"669.00","billing_amount_with_tax":"£19,234.80","price_difference_percentage":"1.268"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);
  });

  test("Page displays invoice page header", async () => {
    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=1&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Vendor One Mar 2023 Invoice"); // page heading
    expect(response.text).toMatchSnapshot();
  });

  test("Page displays 'no data' message", async () => {
    const request = supertest(app);
    const response = await request.get(
      "/invoice?contract_id=1&year=2023&month=06" // No data for this month
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Vendor One Jun 2023 Invoice"); // page heading
    expect(response.text).toContain("Invoice and events missing"); // banner
  });

  test("Page displays Events Missing Banner Text and both line items in the Reconciliation Table for Mar 2023", async () => {
    // There are two line items for Mar 2023, but only the invoice
    // missing message should appear as it's the highest priority.
    givenExtractResults = `{"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"Passport check","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"£0.00","transaction_price_formatted":"","price_difference":"","billing_quantity":"2822", "transaction_quantity":"", "quantity_difference":"","billing_amount_with_tax":"£0","price_difference_percentage":"${MN_EVENTS_MISSING.magicNumber}"}
{"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"ABC Charge","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"16,029.00","transaction_price_formatted":"15,828.30","price_difference":"200.70","billing_quantity":"53430", "transaction_quantity":"52761", "quantity_difference":"669.00","billing_amount_with_tax":"£19,234.80","price_difference_percentage":"1.268"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=1&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Vendor One Mar 2023 Invoice"); // page heading
    expect(response.text).toContain(MN_EVENTS_MISSING.bannerText); // banner
    expect(response.text).not.toContain("Invoice above threshold"); // banner
    expect(response.text).toContain("1.268"); // percentage discrepancy in table
    expect(response.text).toContain(STATUS_LABEL_ABOVE_THRESHOLD.statusMessage); // status in table for discrepancy 1.268
    expect(response.text).toContain(STATUS_LABEL_ERROR.statusMessage); // status in table for Events missing
  });

  test("Page displays Invoice data missing Banner Text and three line items in the Reconciliation Table for Mar 2023", async () => {
    // There are three different line items with problems, but only the
    // Invoice data missing should appear in the banner as it has higher priority than the others. All three line items will be in the Reconciliation Table
    givenExtractResults = `{"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"Passport check","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"","transaction_price_formatted":"2,698.80","price_difference":"","billing_quantity":"", "transaction_quantity":"8996", "quantity_difference":"","billing_amount_with_tax":"","price_difference_percentage":"${MN_INVOICE_MISSING.magicNumber}"}
  {"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"ABC Charge","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"","transaction_price_formatted":"","price_difference":"","billing_quantity":"", "transaction_quantity":"", "quantity_difference":"","billing_amount_with_tax":"","price_difference_percentage":"${MN_RATES_MISSING.magicNumber}"}
{"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"ABC Charge","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"27.50","transaction_price_formatted":"0.00","price_difference":"27.50","billing_quantity":"11", "transaction_quantity":"2", "quantity_difference":"9.00","billing_amount_with_tax":"£19,234.80","price_difference_percentage":"${MN_UNEXPECTED_CHARGE.magicNumber}"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=1&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Vendor One Mar 2023 Invoice"); // page heading
    expect(response.text).toContain(MN_INVOICE_MISSING.bannerText); // banner
    expect(response.text).toContain(MN_RATES_MISSING.bannerText); // table
    expect(response.text).toContain(STATUS_LABEL_ERROR.statusMessage); // status in table for Unable to find rate
    expect(response.text).toContain(MN_UNEXPECTED_CHARGE.bannerText); // table
    expect(response.text).toContain(STATUS_LABEL_ABOVE_THRESHOLD.statusMessage); // status in table for Unexpected Charge
  });

  test("Page displays Invoice above threshold banner text and three line items in the Reconciliation Table for Mar 2023", async () => {
    // The single line item that's over threshold should cause the error banner
    // even though the other line items are within or below threshold.
    givenExtractResults = `{"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"Passport check","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"293.19","transaction_price_formatted":"266.82","price_difference":"26.37","billing_quantity":"73298", "transaction_quantity":"66706", "quantity_difference":"6,592.00","billing_amount_with_tax":"351.83","price_difference_percentage":"9.8814"}
    {"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"Passport check","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"3,850.16","transaction_price_formatted":"3,854.92","price_difference":"-4.76","billing_quantity":"11324", "transaction_quantity":"11338", "quantity_difference":"-14","billing_amount_with_tax":"4,620.19","price_difference_percentage":"-1.1235"}
    {"vendor_id":"vendor_testvendor1","vendor_name":"Vendor One","service_name":"Passport check","month":"03","year":"2023","contract_id":"1","contract_name":"C01234","billing_price_formatted":"100","transaction_price_formatted":"100","price_difference":"0.00","billing_quantity":"100", "transaction_quantity":"100", "quantity_difference":"100.00","billing_amount_with_tax":"110","price_difference_percentage":"0"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=1&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Vendor One Mar 2023 Invoice"); // page heading
    expect(response.text).toContain("Invoice above threshold"); // banner
    expect(response.text).not.toContain("Invoice below threshold"); // banner
    expect(response.text).not.toContain("Invoice within threshold"); // banner
    expect(response.text).toContain("9.8814"); // percentage discrepancy in table
    expect(response.text).toContain(STATUS_LABEL_ABOVE_THRESHOLD.statusMessage); // status in table for Above Threshold
    expect(response.text).toContain("-1.1235"); // percentage discrepancy in table
    expect(response.text).toContain(STATUS_LABEL_BELOW_THRESHOLD.statusMessage); // status in table for Below Threshold
    expect(response.text).toContain("0"); // percentage discrepancy in table
    expect(response.text).toContain(
      STATUS_LABEL_WITHIN_THRESHOLD.statusMessage
    ); // status in table for Within Threshold
  });
});
