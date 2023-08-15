import { getFromEnv, getMonthQuarter } from "../../shared/utils";
import { getContractPeriods } from "./get-contract-periods";
import { getContracts } from "./get-contracts";
import { getLineItems } from "./get-line-items";
import { getOverviewRows } from "./get-overview-rows";

jest.mock("../../shared/utils");
const mockedGetFromEnv = getFromEnv as jest.Mock;
const mockedGetMonthQuarter = getMonthQuarter as jest.Mock;

jest.mock("./get-contracts");
const mockedGetContracts = getContracts as jest.Mock;

jest.mock("./get-contract-periods");
const mockedGetContractPeriods = getContractPeriods as jest.Mock;

jest.mock("./get-line-items");
const mockedGetLineItems = getLineItems as jest.Mock;

describe("getOverviewRows", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockedGetFromEnv.mockImplementation((key) =>
      key === "STORAGE_BUCKET" ? "given storage bucket" : undefined
    );

    // Arrange
    mockedGetContracts.mockResolvedValue([
      { id: "nc1", name: "NewContract", vendorName: "New Vendor" },
      { id: "c1", name: "C01234", vendorName: "Vendor One" },
      { id: "m2", name: "MOU", vendorName: "Vendor Two" },
    ]);
    mockedGetContractPeriods
      .mockResolvedValueOnce([]) // New contract has no data
      .mockResolvedValueOnce([
        { isQuarter: false, month: "05", prettyMonth: "May", year: "2023" },
        { isQuarter: false, month: "06", prettyMonth: "Jun", year: "2023" },
      ])
      .mockResolvedValue([
        { isQuarter: false, month: "06", prettyMonth: "Jun", year: "2023" },
        { isQuarter: true, month: "07", prettyMonth: "Jul", year: "2023" },
      ]);
    mockedGetLineItems
      .mockResolvedValueOnce([
        {
          vendor_id: "vendor_testvendor1",
          vendor_name: "Vendor One",
          contract_id: "c1",
          contract_name: "C01234",
          service_name: "Fraud Check",
          year: "2023",
          month: "06",
          price_difference: "",
          price_difference_percentage: "-1234567.03", // Invoice data missing
          transaction_price_formatted: "£5,889.14",
          billing_quantity: "",
          transaction_quantity: "1117321",
          quantity_difference: "",
          billing_amount_with_tax: "",
          billing_price_formatted: "",
          invoice_is_quarterly: "false",
        },
        {
          vendor_id: "vendor_testvendor1",
          vendor_name: "Vendor One",
          contract_id: "c1",
          contract_name: "C01234",
          service_name: "Standard Charge",
          year: "2023",
          month: "06",
          price_difference: "£200.70",
          price_difference_percentage: "1.268", // Above threshold
          transaction_price_formatted: "£15,828.30",
          billing_quantity: "53430",
          transaction_quantity: "52761",
          quantity_difference: "669",
          billing_amount_with_tax: "£19,234.80",
          billing_price_formatted: "£16,029.00",
          invoice_is_quarterly: "false",
        },
      ])
      .mockResolvedValueOnce([
        {
          vendor_id: "vendor_testvendor2",
          vendor_name: "Vendor Two",
          contract_id: "m2",
          contract_name: "MOU",
          service_name: "Fraud Check",
          year: "2023",
          month: "07",
          price_difference: "£-4.76",
          price_difference_percentage: "-0.1235", // Invoice within threshold
          transaction_price_formatted: "£3,854.92",
          billing_quantity: "11324",
          transaction_quantity: "11338",
          quantity_difference: "-14",
          billing_amount_with_tax: "£4,620.19",
          billing_price_formatted: "£3,850.16",
          invoice_is_quarterly: "true",
        },
      ]);
    mockedGetMonthQuarter.mockReturnValue("Q5");
  });

  test("Should return the data for the Overview Table", async () => {
    // Act
    const result = await getOverviewRows();
    // Assert
    expect(mockedGetContractPeriods).toHaveBeenNthCalledWith(1, "nc1");
    expect(mockedGetContractPeriods).toHaveBeenNthCalledWith(2, "c1");
    expect(mockedGetContractPeriods).toHaveBeenNthCalledWith(3, "m2");

    expect(mockedGetLineItems).toHaveBeenNthCalledWith(
      1,
      "c1",
      "2023",
      "06",
      false
    );
    expect(mockedGetLineItems).toHaveBeenNthCalledWith(
      2,
      "m2",
      "2023",
      "07",
      true
    );

    expect(mockedGetMonthQuarter).toHaveBeenCalledTimes(2);
    expect(mockedGetMonthQuarter).toHaveBeenCalledWith("07");

    expect(result).toEqual([
      {
        contractLinkData: {
          href: "/contracts/c1/invoices",
          text: "C01234",
        },
        vendorName: "Vendor One",
        year: "2023",
        prettyMonthOrQuarter: "Jun",
        reconciliationDetails: {
          tagClass: "govuk-tag--grey",
          bannerMessage: "Invoice data missing",
        },
        invoiceLinkData: {
          href: "/contracts/c1/invoices/2023-06",
          text: "View Invoice",
        },
      },
      {
        contractLinkData: {
          href: "/contracts/m2/invoices",
          text: "MOU",
        },
        vendorName: "Vendor Two",
        year: "2023",
        prettyMonthOrQuarter: "Q5",
        reconciliationDetails: {
          tagClass: "govuk-tag--green",
          bannerMessage: "Invoice within threshold",
        },
        invoiceLinkData: {
          href: "/contracts/m2/invoices/2023-q5",
          text: "View Invoice",
        },
      },
    ]);
  });
});
