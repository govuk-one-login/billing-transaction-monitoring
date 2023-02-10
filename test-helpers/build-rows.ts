import { CsvRow } from "../src/handlers/transaction-csv-to-json-event/process-row";

export function buildRow(
  vendor: string,
  timestamp: string,
  requestId: string,
  mloa: string,
  status: string,
  rpId: string
): CsvRow {
  return {
    "Idp Entity Id": vendor,
    Timestamp: timestamp,
    "Request Id": requestId,
    "Minimum Level Of Assurance": mloa,
    "Billable Status": status,
    "RP Entity Id": rpId,
  };
}
