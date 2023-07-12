import { fetchS3 } from "../../shared/utils";
import { getContractPeriods } from "./get-contract-periods";
import { fakeDataRow } from "./test-builders";

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("getContractPeriods", () => {
  let contractId: string;

  beforeEach(() => {
    process.env = {
      STORAGE_BUCKET: "given storage bucket",
    };
  });

  test("should return the month, year and prettyMonth", async () => {
    // Arrange
    contractId = "1";
    mockedFetchS3.mockResolvedValue(
      fakeDataRow("2023", "03", contractId, "test1") +
        "\n" +
        fakeDataRow("2023", "03", "2", "test1") +
        "\n" +
        fakeDataRow("2023", "04", contractId, "test1") +
        "\n" +
        fakeDataRow("2023", "05", contractId, "test1") +
        "\n" +
        fakeDataRow("2023", "05", contractId, "test2") +
        "\n" +
        fakeDataRow("2023", "06", contractId, "test1")
    );
    // Act
    const result = await getContractPeriods(contractId);
    // Assert
    expect(result).toEqual([
      { month: "03", prettyMonth: "Mar", year: "2023" },
      { month: "04", prettyMonth: "Apr", year: "2023" },
      { month: "05", prettyMonth: "May", year: "2023" },
      { month: "06", prettyMonth: "Jun", year: "2023" },
    ]);
  });
});
