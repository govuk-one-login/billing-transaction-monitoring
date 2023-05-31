import { AthenaQueryExecutor } from "./athena-query-executor";
import { fetchViewData } from "./fetch-view-data";
import { Env } from "./types";

jest.mock("./athena-query-executor");
const MockedAthenaQueryExecutor = AthenaQueryExecutor as jest.MockedClass<
  typeof AthenaQueryExecutor
>;

describe("fetchViewData", () => {
  const mockedAthenaQueryExecutorFetchResults = jest.fn();
  MockedAthenaQueryExecutor.mockReturnValue({
    fetchResults: mockedAthenaQueryExecutorFetchResults,
  } as any);

  const mockEnv: Record<Env, string> = {
    DESTINATION_BUCKET: "some destination bucket",
    DATABASE_NAME: "some database name",
    QUERY_RESULTS_BUCKET: "some query results bucket",
  };

  const queryResults = { foo: "bar" };
  mockedAthenaQueryExecutorFetchResults.mockResolvedValue(queryResults);

  it("returns the results from calling through to the athena query executor", async () => {
    const results = await fetchViewData(mockEnv);
    expect(results).toEqual(queryResults);
    expect(mockedAthenaQueryExecutorFetchResults).toHaveBeenCalledTimes(1);
  });
});
