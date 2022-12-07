import { Textract } from "aws-sdk";
import { fetchExpenseDocuments } from "./fetch-expense-documents";
import { logTextractWarnings } from "./log-textract-warnings";

jest.mock("aws-sdk");
const MockedTextract = Textract as jest.MockedClass<typeof Textract>;

jest.mock("./log-textract-warnings");
const mockedLogTextractWarnings = logTextractWarnings as jest.MockedFn<
  typeof logTextractWarnings
>;

describe("Expense documents fetcher", () => {
  let mockedGetExpenseAnalysis: jest.Mock;
  let mockedGetExpenseAnalysisPromise: jest.Mock;
  let mockedResponse: Textract.GetExpenseAnalysisResponse;
  let givenJobId: string;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedResponse = { JobStatus: "SUCCEEDED" };

    mockedGetExpenseAnalysisPromise = jest
      .fn()
      .mockResolvedValue(mockedResponse);

    mockedGetExpenseAnalysis = jest.fn(() => ({
      promise: mockedGetExpenseAnalysisPromise,
    }));

    MockedTextract.mockReturnValue({
      getExpenseAnalysis: mockedGetExpenseAnalysis,
    } as any);

    givenJobId = "given job ID";
  });

  test("Expense documents fetcher with request failure", async () => {
    const mockedError = "mocked error";
    mockedGetExpenseAnalysisPromise.mockRejectedValueOnce(mockedError);

    let resultError;
    try {
      await fetchExpenseDocuments(givenJobId);
    } catch (error) {
      resultError = error;
    }

    expect(mockedGetExpenseAnalysis).toHaveBeenCalledTimes(1);
    expect(mockedGetExpenseAnalysis).toHaveBeenCalledWith({
      JobId: givenJobId,
      NextToken: undefined,
    });
    expect(mockedGetExpenseAnalysisPromise).toHaveBeenCalledTimes(1);
    expect(resultError).toBe(mockedError);
  });

  test("Expense documents fetcher with response warnings", async () => {
    const mockedWarnings = "mocked warnings" as unknown as Textract.Warnings;
    mockedResponse.Warnings = mockedWarnings;

    await fetchExpenseDocuments(givenJobId);

    expect(mockedLogTextractWarnings).toHaveBeenCalledTimes(1);
    expect(mockedLogTextractWarnings).toHaveBeenCalledWith(mockedWarnings);
  });

  test("Expense documents fetcher with error message", async () => {
    mockedResponse.StatusMessage = "mocked error message";

    let resultError;
    try {
      await fetchExpenseDocuments(givenJobId);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Expense documents fetcher without success status", async () => {
    mockedResponse.JobStatus = "mocked unsuccessful status";

    let resultError;
    try {
      await fetchExpenseDocuments(givenJobId);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Expense documents fetcher with response with one page of documents", async () => {
    const mockedDocument1 = "mocked document";
    const mockedDocument2 = "mocked other document";
    mockedResponse.ExpenseDocuments = [
      mockedDocument1,
      mockedDocument2,
    ] as unknown as Textract.ExpenseDocument[];

    const result = await fetchExpenseDocuments(givenJobId);

    expect(result).toEqual([mockedDocument1, mockedDocument2]);
    expect(mockedGetExpenseAnalysis).toHaveBeenCalledTimes(1);
    expect(mockedGetExpenseAnalysis).toHaveBeenCalledWith({
      JobId: givenJobId,
      NextToken: undefined,
    });
  });

  test("Expense documents fetcher with response with two pages of documents", async () => {
    const mockedDocument1 = "mocked document";
    const mockedDocument2 = "mocked other document";
    const mockedDocument3 = "mocked other other document";
    const mockedPaginationToken = "mocked pagination token";
    mockedGetExpenseAnalysisPromise
      .mockResolvedValue({
        ...mockedResponse,
        ExpenseDocuments: [mockedDocument3],
      })
      .mockResolvedValueOnce({
        ...mockedResponse,
        ExpenseDocuments: [mockedDocument1, mockedDocument2],
        NextToken: mockedPaginationToken,
      });

    const result = await fetchExpenseDocuments(givenJobId);

    expect(result).toEqual([mockedDocument1, mockedDocument2, mockedDocument3]);
    expect(mockedGetExpenseAnalysis).toHaveBeenCalledTimes(2);
    expect(mockedGetExpenseAnalysis).toHaveBeenCalledWith({
      JobId: givenJobId,
      NextToken: undefined,
    });
    expect(mockedGetExpenseAnalysis).toHaveBeenLastCalledWith({
      JobId: givenJobId,
      NextToken: mockedPaginationToken,
    });
  });
});
