// import { fetchS3 } from "../../shared/utils";
import { getContractPeriods } from "./get-contract-periods";
import { getContracts } from "./get-contracts";
import { getOverviewRows } from "./get-overview-rows";

jest.mock("./get-contracts");
const mockedGetContracts = getContracts as jest.Mock;

jest.mock("./get-contract-periods");
const mockedGetContractPeriods = getContractPeriods as jest.Mock;

// jest.mock("../../shared/utils");
// const mockedFetchS3 = fetchS3 as jest.Mock;

describe("getOverviewRows", () => {
  beforeEach(() => {
    process.env = {
      STORAGE_BUCKET: "given storage bucket",
    };

    // Arrange
    mockedGetContracts.mockResolvedValue([
      { id: "1", name: "C01234", vendorName: "Vendor One" },
      { id: "2", name: "MOU", vendorName: "Vendor Two" },
    ]);
    mockedGetContractPeriods.mockResolvedValue([
      { month: "05", prettyMonth: "May", year: "2023" },
      { month: "06", prettyMonth: "Jun", year: "2023" },
    ]);
  });

  test("Should return the data for the Overview Table", async () => {
    // Act
    const result = await getOverviewRows();
    // Assert
    expect(result).toEqual([
      {
        contractName: "C01234",
        vendorName: "Vendor One",
        month: "Jun2023",
        reconciliationDetails: {
          class: "govuk-tag--green",
          message: "Invoice Within Threshold",
        },
        details: "more details",
      },
      {
        contractName: "MOU",
        vendorName: "Vendor Two",
        month: "Jun2023",
        reconciliationDetails: {
          class: "govuk-tag--green",
          message: "Invoice Within Threshold",
        },
        details: "more details",
      },
    ]);
  });
});
