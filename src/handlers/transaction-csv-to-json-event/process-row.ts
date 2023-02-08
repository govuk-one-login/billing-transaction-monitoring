import {
  getEventNameFromRules,
  EventNameRules,
} from "./get-event-name-from-rules";

export interface TransactionEventBodyObject {
  event_id: string;
  timestamp: number;
  timestamp_formatted: string;
  event_name: string;
  component_id: string;
  client_id: string;
}

export interface CsvRow {
  "Idp Entity Id": string;
  Timestamp: string;
  "Request Id": string;
  "Minimum Level Of Assurance": string;
  "Billable Status": string;
  "RP Entity Id": string;
}

export function processRow(
  row: CsvRow,
  idpClientLookup: { [index: string]: string },
  eventNameRules: EventNameRules
): TransactionEventBodyObject {
  const idpEntityId = row["Idp Entity Id"];
  const requestId = row["Request Id"];
  const timestampFormatted = row.Timestamp;
  const timestamp = Math.floor(Date.parse(timestampFormatted) / 1000);
  const rpEntityId = row["RP Entity Id"];

  return {
    event_id: requestId,
    timestamp,
    timestamp_formatted: timestampFormatted,
    event_name: getEventNameFromRules(eventNameRules, idpEntityId, row),
    component_id: rpEntityId,
    client_id: idpClientLookup[idpEntityId],
  };
}
