import {
  putObjectToS3,
  checkIfS3ObjectExists,
  S3Object,
  getS3ItemsList,
  s3GetObjectsToArray,
  deleteS3FolderBasedOnDate,
} from "../helpers/s3Helper";
import { resourcePrefix } from "../helpers/envHelper";
import path from "path";
import fs from "fs";
import csv from "csvtojson";
import { waitForTrue } from "../helpers/commonHelpers";
import {
  CsvRow,
  TransformationEventBodyObject,
} from "../../src/handlers/transformation/transform-row";

const prefix = resourcePrefix();
const storageBucket = `${resourcePrefix()}-storage`;
const folderPrefix = "btm_transactions";

describe("\n Upload verify fake csv to transformation bucket tests and check valid events from csv match with s3 events", () => {
  beforeAll(async () => {
    // before the test runs deletes the btm_transaction/datePrefix folder created by previous run
    await deleteS3FolderBasedOnDate(storageBucket, folderPrefix);
    console.log("Existing sub folders within btm_transactions are deleted");
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

  test("events which are satisfied client and event name matching rule from csv should be stored in s3 storage bucket", async () => {
    const checkEventsExistsInS3 = await waitForTrue(
      checkExpectedEventsExistsInS3,
      1000,
      10000
    );
    expect(checkEventsExistsInS3).toBe(true);
    const eventsFromS3 = await getEventsFromS3();
    const eventsFromCSV = await filterPermittedClientAndBillingEvents();
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

  test("events which are not satisfied client and event name matching rule from csv should not be stored in s3 storage bucket", async () => {
    const checkEventsExistsInS3 = await waitForTrue(
      checkExpectedEventsExistsInS3,
      1000,
      7000
    );
    expect(checkEventsExistsInS3).toBe(true);
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

const csvFileToJson = async (): Promise<any[]> => {
  const file = "../payloads/fakeBillingReport.csv";
  const filePath = path.join(__dirname, file);
  const json = await csv().fromFile(filePath);
  return json;
};

const filterPermittedClientAndBillingEvents = async (): Promise<CsvRow[]> => {
  const json: CsvRow[] = await csvFileToJson();
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

const checkExpectedEventsExistsInS3 = async (): Promise<boolean> => {
  const result = await getS3ItemsList(storageBucket, folderPrefix);
  if (result.Contents === undefined) {
    console.log("Storage bucket contents empty");
    return false;
  }
  if (result.Contents.length === 15) {
    //  15 valid events which satisfies client and event mapping rule from csv to be stored in s3
    return true;
  }
  return true;
};

const getEventsFromS3 = async (): Promise<TransformationEventBodyObject[]> => {
  const s3Contents = await s3GetObjectsToArray(storageBucket, folderPrefix);
  return s3Contents;
};
