import { fetchS3 } from "../../shared/utils";
import { getDashboardExtract } from "./get-dashboard-extract";

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("getDashboardExtract", () => {
  beforeEach(() => {
    process.env = {
      STORAGE_BUCKET: "given storage bucket",
    };
  });

  test("Should parse multi-line JSON into object", async () => {
    const mockedS3FileText = '{"a":"b","c":"d"}\n{"e":"f"}\n{"g":"h"}';
    const expectedExtract = [{ a: "b", c: "d" }, { e: "f" }, { g: "h" }];
    mockedFetchS3.mockReturnValue(mockedS3FileText);
    expect(await getDashboardExtract()).toEqual(expectedExtract);
  });
});
