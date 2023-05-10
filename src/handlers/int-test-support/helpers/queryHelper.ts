import {
  startQueryExecutionCommand,
  waitAndGetQueryResults,
} from "./athenaHelper";
import { resourcePrefix } from "./envHelper";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;

export const queryAthena = async (
  queryString: string
): Promise<Array<Record<string, string>>> => {
  const queryId = await startQueryExecutionCommand({
    databaseName,
    queryString,
  });
  return await waitAndGetQueryResults(queryId);
};
