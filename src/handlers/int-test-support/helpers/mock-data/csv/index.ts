import { augmentTestCases, TestCases } from "./addFauxDataToTestCases";
import { objectsToCSV } from "./objectsToCsv";
import { testCases } from "./transformCSV-to-event-test-data";

export const mockIdpCsvData = (): { testCases: TestCases; csv: Buffer } => {
  const augmentedData = augmentTestCases(testCases, {
    timestamp: "2023-01-01T00:27:41.186Z",
    givenRPEntityId: "fake rp entity id",
  });
  const csvString = objectsToCSV(augmentedData, {
    filterKeys: ["expectedPath"],
    renameKeys: new Map([
      ["givenEntity", "Idp Entity Id"],
      ["givenLoa", "Minimum Level Of Assurance"],
      ["givenStatus", "Billable Status"],
      ["expectedEventId", "Request Id"],
      ["givenRPEntityId", "RP Entity Id"],
      ["timestamp", "Timestamp"],
    ]),
  });
  return { testCases, csv: Buffer.from(csvString) };
};
