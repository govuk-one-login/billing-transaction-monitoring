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
} from "../frontend-utils";

jest.mock("../../handler-context/context-builder");
const mockedMakeCtxConfig = makeCtxConfig as jest.Mock;

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("invoice handler", () => {
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
    mockedMakeCtxConfig.mockResolvedValue({
      services: givenServicesConfig,
      contracts: givenContractsConfig,
    });

    givenExtractResults = `{"month":"10","year":"2023","contract_id":"${contractId}","price_difference_percentage":"0"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"0"}
{"month":"04","year":"2023","contract_id":"${contractId}","price_difference_percentage":"0"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);
  });

  test("Page displays invoice info", async () => {
    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=${contractId}&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Home");
    expect(response.text).toContain("Contracts");
    expect(response.text).toContain("C01234 - Vendor One");
    expect(response.text).toMatchSnapshot();
  });

  test("Page displays 'no data' message", async () => {
    givenExtractResults = "";
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get(
      "/invoice?contract_id=1&year=2023&month=03"
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Invoice and events missing");
  });

  test("Page displays invoice missing message", async () => {
    // There are multiple different line items with problems, but only the invoice
    // missing message should appear as it's the highest priority.
    givenExtractResults = `{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"${MN_RATES_MISSING.magicNumber}"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"${MN_INVOICE_MISSING.magicNumber}"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"${MN_EVENTS_MISSING.magicNumber}"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"0"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"${MN_UNEXPECTED_CHARGE.magicNumber}"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=${contractId}&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain(MN_INVOICE_MISSING.bannerText);
    expect(response.text).not.toContain(MN_RATES_MISSING.bannerText);
    expect(response.text).not.toContain(MN_EVENTS_MISSING.bannerText);
    expect(response.text).not.toContain(MN_UNEXPECTED_CHARGE.bannerText);
  });

  test("Page displays events missing message", async () => {
    // There are multiple different line items with problems, but only the events
    // missing message should appear as it has higher priority than the others.
    givenExtractResults = `{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"${MN_RATES_MISSING.magicNumber}"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"2"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"${MN_EVENTS_MISSING.magicNumber}"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"${MN_UNEXPECTED_CHARGE.magicNumber}"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=${contractId}&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain(MN_EVENTS_MISSING.bannerText);
    expect(response.text).not.toContain(MN_RATES_MISSING.bannerText);
    expect(response.text).not.toContain(MN_UNEXPECTED_CHARGE.bannerText);
  });

  test("Page displays rates missing message", async () => {
    // There are two different line items with problems, but only the rates
    // missing message should appear as it has higher priority than the other.
    givenExtractResults = `{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"${MN_RATES_MISSING.magicNumber}"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"2"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"${MN_UNEXPECTED_CHARGE.magicNumber}"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=${contractId}&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain(MN_RATES_MISSING.bannerText);
    expect(response.text).not.toContain(MN_UNEXPECTED_CHARGE.bannerText);
  });

  test("Page displays unexpected charge message", async () => {
    // The unexpected charge line should take precedence over the line item that's over threshold.
    givenExtractResults = `{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"2"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"${MN_UNEXPECTED_CHARGE.magicNumber}"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=${contractId}&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain(MN_UNEXPECTED_CHARGE.bannerText);
  });

  test("Page displays above threshold message", async () => {
    // The single line item that's over threshold should cause the warning
    // even though the other line items are okay or below threshold.
    givenExtractResults = `{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"0"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"2"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"-2"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"0"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=${contractId}&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Invoice above threshold");
    expect(response.text).not.toContain("Invoice below threshold");
    expect(response.text).not.toContain("Invoice within threshold");
  });

  test("Page displays below threshold message", async () => {
    // The single line item that's over threshold should cause the warning
    // even though the other line items are okay.
    givenExtractResults = `{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"0"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"-2"}
{"month":"03","year":"2023","contract_id":"${contractId}","price_difference_percentage":"0"}`;
    mockedFetchS3.mockResolvedValue(givenExtractResults);

    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=${contractId}&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Invoice below threshold");
    expect(response.text).not.toContain("Invoice within threshold");
  });

  test("Page displays within threshold message", async () => {
    // No items are outside threshold in the default data set, so we should get the nominal message.
    const request = supertest(app);
    const response = await request.get(
      `/invoice?contract_id=${contractId}&year=2023&month=03`
    );
    expect(response.status).toBe(200);
    expect(response.text).toContain("Invoice within threshold");
  });
});
