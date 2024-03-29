import { fetchS3, getFromEnv } from "../../shared/utils";
import { getLineItems } from "./get-line-items";
import { fakeDataRow } from "./test-builders";

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;
const mockedGetFromEnv = getFromEnv as jest.Mock;

describe("getLineItems", () => {
  let contractId: string;

  beforeEach(() => {
    jest.resetAllMocks();

    // Arrange
    contractId = "1";
    mockedFetchS3.mockResolvedValue(
      fakeDataRow("2023", "03", contractId, "test1", true) +
        "\n" +
        fakeDataRow("2023", "04", contractId, "test2", false) +
        "\n" +
        fakeDataRow("2023", "04", contractId, "test1", true) +
        "\n" +
        fakeDataRow("2023", "05", contractId, "test1", false) +
        "\n" +
        fakeDataRow("2023", "05", contractId, "test2", false)
    );
    mockedGetFromEnv.mockImplementation((key) =>
      key === "STORAGE_BUCKET" ? "given storage bucket" : undefined
    );
  });

  test("should return the line items for a given non-quarterly contract id, year and month", async () => {
    // Act
    const result = await getLineItems(contractId, "2023", "05");
    // Assert
    expect(result).toEqual([
      {
        vendor_id: "test1_vendor_id",
        vendor_name: "test1 vendor_name",
        contract_id: "1",
        contract_name: "test1 contract_name",
        service_name: "test1 service_name",
        year: "2023",
        month: "05",
        price_difference: "test1 pd",
        price_difference_percentage: "test1 pdp",
        transaction_price_formatted: "test1 tpf",
        billing_quantity: "2",
        transaction_quantity: "11",
        quantity_difference: "-9",
        billing_amount_with_tax: "test1 bawt",
        billing_price_formatted: "test1 bpf",
        billing_unit_price: "test1 bup",
        invoice_is_quarterly: "false",
      },
      {
        vendor_id: "test2_vendor_id",
        vendor_name: "test2 vendor_name",
        contract_id: "1",
        contract_name: "test2 contract_name",
        service_name: "test2 service_name",
        year: "2023",
        month: "05",
        price_difference: "test2 pd",
        price_difference_percentage: "test2 pdp",
        transaction_price_formatted: "test2 tpf",
        billing_quantity: "2",
        transaction_quantity: "11",
        quantity_difference: "-9",
        billing_amount_with_tax: "test2 bawt",
        billing_price_formatted: "test2 bpf",
        billing_unit_price: "test2 bup",
        invoice_is_quarterly: "false",
      },
    ]);
  });

  test("should return the line items for a given quarterly contract id, year and month", async () => {
    // Act
    const result = await getLineItems(contractId, "2023", 4, true);
    // Assert
    expect(result).toEqual([
      {
        vendor_id: "test1_vendor_id",
        vendor_name: "test1 vendor_name",
        contract_id: "1",
        contract_name: "test1 contract_name",
        service_name: "test1 service_name",
        year: "2023",
        month: "04",
        price_difference: "test1 pd",
        price_difference_percentage: "test1 pdp",
        transaction_price_formatted: "test1 tpf",
        billing_quantity: "2",
        transaction_quantity: "11",
        quantity_difference: "-9",
        billing_amount_with_tax: "test1 bawt",
        billing_price_formatted: "test1 bpf",
        billing_unit_price: "test1 bup",
        invoice_is_quarterly: "true",
      },
    ]);
  });
});
