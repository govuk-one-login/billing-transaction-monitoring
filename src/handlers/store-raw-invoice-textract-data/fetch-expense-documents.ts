import { Textract } from "aws-sdk";
import { logTextractWarnings } from "./log-textract-warnings";

export const fetchExpenseDocuments = async (
  jobId: string
): Promise<Textract.ExpenseDocument[]> => {
  const documents: Textract.ExpenseDocument[] = [];

  const textract = new Textract();

  let paginationToken: string | undefined;
  do {
    const params = {
      JobId: jobId,
      NextToken: paginationToken,
    };

    const response = await textract.getExpenseAnalysis(params).promise();

    if (response.Warnings !== undefined) logTextractWarnings(response.Warnings);

    if (response.StatusMessage !== undefined)
      throw new Error(response.StatusMessage);

    if (response.JobStatus !== "SUCCEEDED")
      throw new Error(`Fetched job not successful: ${jobId}`);

    if (response.ExpenseDocuments !== undefined)
      documents.push(...response.ExpenseDocuments);

    paginationToken = response.NextToken;
  } while (paginationToken !== undefined);

  return documents;
};
