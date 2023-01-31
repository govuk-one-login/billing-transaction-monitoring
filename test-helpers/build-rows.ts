import { CsvRow } from "../src/handlers/transaction-csv-to-json-event/process-row";

export function buildRow(
  client: string,
  timestamp: string,
  requestId: string,
  mloa: string,
  status: string,
  rpId: string
): CsvRow {
  return {
    "Idp Entity Id": client,
    Timestamp: timestamp,
    "Request Id": requestId,
    "Minimum Level Of Assurance": mloa,
    "Billable Status": status,
    "RP Entity Id": rpId,
  };
}
