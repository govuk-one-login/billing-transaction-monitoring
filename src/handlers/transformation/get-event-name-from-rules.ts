import { CsvRow } from "./process-row";

// To Do Tidy up the interface, so its not tightly coupled to the specific CSV.
interface Rules {
  "Minimum Level Of Assurance": string;
  "Billable Status": string;
  "Event Name": string;
}

export interface EventNameRules {
  [key: string]: Rules[];
}

export function getEventNameFromRules(
  eventNameRules: EventNameRules,
  idpEntityId: string,
  row: CsvRow
): string {
  const minLevelOfAssurance = row["Minimum Level Of Assurance"];
  const billableStatus = row["Billable Status"];

  const rules = eventNameRules[idpEntityId];

  if (rules !== undefined) {
    const eventName = rules.find(
      (rule) =>
        minLevelOfAssurance === rule["Minimum Level Of Assurance"] &&
        billableStatus === rule["Billable Status"]
    );
    return eventName !== undefined ? eventName["Event Name"] : "Unknown";
  }
  return "Unknown";
}
