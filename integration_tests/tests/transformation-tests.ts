import {
  putObjectToS3,
  checkIfS3ObjectExists,
  S3Object,
  deleteDirectoryRecursiveInS3,
  getS3ItemsList,
  s3GetObjectsToArray,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";
import path from "path";
import fs from "fs";
import csv from "csvtojson";
import { waitForTrue } from "../helpers/commonHelpers";

const prefix = resourcePrefix();
const storageBucket = `${resourcePrefix()}-storage`;
const folderPrefix = "btm_transactions";

describe("\n Upload verify fake csv to transformation bucket tests", () => {
  beforeAll(async () => {
    // before the test runs deletes the btm_transaction/2022-10-01 directory created by previous run
    await deleteDirectoryRecursiveInS3(storageBucket, folderPrefix);
    console.log("Existing directory is deleted");
    const fakeCsvFile = "../payloads/fakeBillingReport.csv";
    const filePath = path.join(__dirname, fakeCsvFile);
    const csvFileData = fs.readFileSync(filePath);
    const testObject: S3Object = {
      bucket: `${prefix}-transformation`,
      key: `fakeBillingReport.csv`,
    };
    await putObjectToS3(testObject, csvFileData);
    const checkCsvFileExists = await checkIfS3ObjectExists(testObject);
    expect(checkCsvFileExists).toBeTruthy();
  });

  test("events which are satisfied client and event name matching rule should be stored in storage bucket", async () => {
    const eventsFromS3 = await getEventsFromS3();
    const eventsFromCSV = await filterPermittedClientAndBillingEvents();
    console.log(eventsFromS3.length);
    const isContains = eventsFromS3.some((s3Obj) => {
      return eventsFromCSV.some((csvObj) => {
        return (
          s3Obj.event_id === csvObj["Request Id"] &&
          s3Obj.component_id === csvObj["RP Entity Id"] &&
          csvObj["Idp Entity Id"].includes(s3Obj.client_id)
        );
      });
    });
    expect(isContains).toBe(true);
  });

  test("events which are not satisfied client and event name matching rule should not be stored in storage bucket", async () => {
    const s3Result = await getEventsFromS3();
    const isContains = s3Result.some((s3Obj) => {
      return (
        s3Obj.client_id !== "client1" &&
        s3Obj.client_id !== "client2" &&
        s3Obj.event_name !== "unknown"
      );
    });
    expect(isContains).toBe(true);
  });
});

type BillingCSV = Array<{
  "Idp Entity Id": string;
  Timestamp: string;
  "Request Id": string;
  "Session Id": string;
  "Hashed Persistent Id": string;
  "Minimum Level Of Assurance": string;
  "Preferred Level Of Assurance": string;
  "Provided Level Of Assurance": string;
  "Billable Status": string;
  "Previous Billed Event Request Id": string;
  "Previous Billed Event Timestamp": string;
  "RP Entity Id": string;
  "Response type": string;
}>;

type s3Response = Array<{
  client_id: string;
  component_id: string;
  event_id: string;
  event_name: string;
  timestamp: number;
  timestamp_formatted: string;
}>;

const csvFileToJson = async (): Promise<any[]> => {
  const file = "../payloads/fakeBillingReport.csv";
  const filePath = path.join(__dirname, file);
  const json = await csv().fromFile(filePath);
  return json;
};

const filterPermittedClientAndBillingEvents = async (): Promise<BillingCSV> => {
  const json: BillingCSV = await csvFileToJson();
  const permittedBillingEvents = json.filter(
    (data) =>
      data["Billable Status"] === "BILLABLE" ||
      data["Billable Status"] === "REPEAT-BILLABLE" ||
      data["Billable Status"] === "BILLABLE-UPLIFT"
  );
  return permittedBillingEvents.filter(
    (data) =>
      data["Idp Entity Id"].includes("client3") ||
      data["Idp Entity Id"].includes("client4")
  );
};

const checkS3ObjListExists = async (): Promise<boolean | undefined> => {
  const result = await getS3ItemsList(storageBucket, folderPrefix);
  if (result.Contents === undefined) {
    console.log("Storage bucket contents not empty");
    return false;
  }

  console.log(result.Contents);
  console.log(result.Contents.length);

  if (result.Contents.length === 13) {
    return true;
  }
};

const getEventsFromS3 = async (): Promise<s3Response> => {
  await waitForTrue(checkS3ObjListExists, 1000, 7000);
  const s3Contents = await s3GetObjectsToArray(storageBucket, folderPrefix);
  return s3Contents;
};
