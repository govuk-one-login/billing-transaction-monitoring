import { getContractPeriods, getDashboardExtract } from "./extract-helper";
import { fetchS3 } from "../shared/utils";

jest.mock("../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("extract helper", () => {
  let contractId: string;

  beforeEach(() => {
    process.env = {
      STORAGE_BUCKET: "given storage bucket",
    };

    contractId = "1";

    mockedFetchS3.mockResolvedValue(
      '{"month":"03","year":"2023","contract_id":"1"}'
    );
  });

  describe("getContractPeriods", () => {
    test("should return the month, year and prettyMonth", async () => {
      // Act
      const result = await getContractPeriods(contractId);
      // Assert
      expect(result).toEqual([
        { month: "03", prettyMonth: "Mar", year: "2023" },
      ]);
    });
  });

  describe("getDashboardExtract", () => {
    test("Should parse multi-line JSON into object", async () => {
      const mockedS3FileText = '{"a":"b","c":"d"}\n{"e":"f"}\n{"g":"h"}';
      const expectedExtract = [{ a: "b", c: "d" }, { e: "f" }, { g: "h" }];
      mockedFetchS3.mockReturnValue(mockedS3FileText);
      expect(await getDashboardExtract()).toEqual(expectedExtract);
    });
  });
});
