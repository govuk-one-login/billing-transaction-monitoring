import { fetchS3, getFromEnv } from "../index";
import { getDashboardExtract } from "./get-dashboard-extract";

jest.mock("../index");
const mockedFetchS3 = fetchS3 as jest.Mock;
const mockedGetFromEnv = getFromEnv as jest.Mock;

describe("getDashboardExtract", () => {
  beforeEach(() => {
    mockedGetFromEnv.mockImplementation((key) =>
      key === "STORAGE_BUCKET" ? "given storage bucket" : undefined
    );
  });

  test("Should parse multi-line JSON into object", async () => {
    const mockedS3FileText = '{"a":"b","c":"d"}\n{"e":"f"}\n{"g":"h"}';
    const expectedExtract = [{ a: "b", c: "d" }, { e: "f" }, { g: "h" }];
    mockedFetchS3.mockReturnValue(mockedS3FileText);
    expect(await getDashboardExtract()).toEqual(expectedExtract);
  });
});
