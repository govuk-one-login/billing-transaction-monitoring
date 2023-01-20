import { CsvRow } from "./transform-row";

interface Rules {
  "Minimum Level Of Assurance": string;
  "Billable Status": string;
  "Event Name": string;
}

export interface EventNameRules {
  [key: string]: Rules[];
}

export async function buildEventName(
  eventNameRules: EventNameRules,
  idpEntityId: string,
  row: CsvRow
): Promise<string> {
  const minLevelOfAssurance = row["Minimum Level Of Assurance"];
  const billableStatus = row["Billable Status"];

  const rules = eventNameRules[idpEntityId];

  if (rules !== undefined) {
    for (const rule of rules) {
      if (
        minLevelOfAssurance === rule["Minimum Level Of Assurance"] &&
        billableStatus === rule["Billable Status"]
      ) {
        return rule["Event Name"];
      }
    }
  }
  return "unknown";
}
