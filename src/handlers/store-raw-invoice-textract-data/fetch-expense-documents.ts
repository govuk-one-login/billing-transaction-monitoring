import { Textract } from "aws-sdk";
import { ValidTextractStatusMessage } from "../../shared/types";
import { isValidTextractStatus } from "./is-valid-textract-status";
import { logTextractWarnings } from "./log-textract-warnings";

interface Response {
  documents: Textract.ExpenseDocument[];
  status: ValidTextractStatusMessage;
}

export const fetchExpenseDocuments = async (
  jobId: string
): Promise<Response> => {
  const documents: Textract.ExpenseDocument[] = [];

  const textract = new Textract();

  let paginationToken: string | undefined;
  let status: ValidTextractStatusMessage | undefined;
  do {
    const params = {
      JobId: jobId,
      NextToken: paginationToken,
    };

    const response = await textract.getExpenseAnalysis(params).promise();

    paginationToken = response.NextToken;

    if (
      !isValidTextractStatus(response.StatusMessage) ||
      (typeof status === "string" && response.StatusMessage !== status)
    ) {
      const statusText = String(response.StatusMessage);
      throw new Error(`Invalid job status: ${statusText}`);
    }

    status = response.StatusMessage;

    if (response.Warnings !== undefined) logTextractWarnings(response.Warnings);

    if (response.ExpenseDocuments !== undefined)
      documents.push(...response.ExpenseDocuments);
  } while (paginationToken !== undefined);

  return { documents, status };
};
