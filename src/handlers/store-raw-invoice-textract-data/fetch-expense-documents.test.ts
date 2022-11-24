import { Textract } from "aws-sdk";
import { ValidTextractStatusMessage } from "../../shared/types";
import { fetchExpenseDocuments } from "./fetch-expense-documents";
import { isValidTextractStatus } from "./is-valid-textract-status";
import { logTextractWarnings } from "./log-textract-warnings";

jest.mock("aws-sdk");
const MockedTextract = Textract as jest.MockedClass<typeof Textract>;

jest.mock("./is-valid-textract-status");
const mockedIsValidTextractStatus =
  isValidTextractStatus as unknown as jest.MockedFn<
    typeof isValidTextractStatus
  >;

jest.mock("./log-textract-warnings");
const mockedLogTextractWarnings = logTextractWarnings as jest.MockedFn<
  typeof logTextractWarnings
>;

describe("Expense documents fetcher", () => {
  let mockedGetExpenseAnalysis: jest.Mock;
  let mockedGetExpenseAnalysisPromise: jest.Mock;
  let mockedStatus: ValidTextractStatusMessage;
  let givenJobId: string;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedStatus = "some status" as ValidTextractStatusMessage;

    mockedGetExpenseAnalysisPromise = jest.fn().mockResolvedValue({
      StatusMessage: mockedStatus,
    });

    mockedGetExpenseAnalysis = jest.fn(() => ({
      promise: mockedGetExpenseAnalysisPromise,
    }));

    MockedTextract.mockReturnValue({
      getExpenseAnalysis: mockedGetExpenseAnalysis,
    } as any);

    mockedIsValidTextractStatus.mockReturnValue(true);

    givenJobId = "given job ID";
  });

  test("Expense documents fetcher with request failure", async () => {
    const mockedError = "some error";
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

  test("Expense documents fetcher with invalid response status", async () => {
    mockedIsValidTextractStatus.mockReturnValue(false);

    let resultError;
    try {
      await fetchExpenseDocuments(givenJobId);
    } catch (error) {
      resultError = error;
    }

    expect(mockedIsValidTextractStatus).toHaveBeenCalledTimes(1);
    expect(resultError).toBeInstanceOf(Error);
  });

  test("Expense documents fetcher with response pagination token", async () => {
    const mockedPaginationToken = "some pagination token";
    mockedGetExpenseAnalysisPromise.mockResolvedValueOnce({
      NextToken: mockedPaginationToken,
      StatusMessage: mockedStatus,
    });

    await fetchExpenseDocuments(givenJobId);

    expect(mockedGetExpenseAnalysis).toHaveBeenCalledTimes(2);
    expect(mockedGetExpenseAnalysisPromise).toHaveBeenCalledTimes(2);
    expect(mockedGetExpenseAnalysis).toHaveBeenCalledWith({
      JobId: givenJobId,
      NextToken: undefined,
    });
    expect(mockedGetExpenseAnalysis).toHaveBeenLastCalledWith({
      JobId: givenJobId,
      NextToken: mockedPaginationToken,
    });
    expect(mockedLogTextractWarnings).not.toHaveBeenCalled();
  });

  test("Expense documents fetcher with multiple responses and inconsistent statuses", async () => {
    mockedGetExpenseAnalysisPromise.mockResolvedValueOnce({
      NextToken: "some pagination token",
      StatusMessage: "some inconsistent status",
    });

    let resultError;
    try {
      await fetchExpenseDocuments(givenJobId);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
    expect(mockedGetExpenseAnalysis).toHaveBeenCalledTimes(2);
    expect(mockedGetExpenseAnalysisPromise).toHaveBeenCalledTimes(2);
  });

  test("Expense documents fetcher with response warnings", async () => {
    const mockedWarnings = "some warnings";
    mockedGetExpenseAnalysisPromise.mockResolvedValueOnce({
      StatusMessage: mockedStatus,
      Warnings: mockedWarnings,
    });

    await fetchExpenseDocuments(givenJobId);

    expect(mockedLogTextractWarnings).toHaveBeenCalledTimes(1);
    expect(mockedLogTextractWarnings).toHaveBeenCalledWith(mockedWarnings);
  });

  test("Expense documents fetcher with response documents", async () => {
    const mockedDocument1 = "some document";
    const mockedDocument2 = "some other document";
    mockedGetExpenseAnalysisPromise.mockResolvedValueOnce({
      StatusMessage: mockedStatus,
      ExpenseDocuments: [mockedDocument1, mockedDocument2],
    });

    const result = await fetchExpenseDocuments(givenJobId);

    expect(result).toEqual({
      documents: [mockedDocument1, mockedDocument2],
      status: mockedStatus,
    });
  });
});
