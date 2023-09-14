import { invokeSyntheticLambda } from "../../src/handlers/int-test-support/helpers/lambdaHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import fs from "fs";
import {
  getSyntheticEventsConfig,
  SyntheticEventsConfigRow,
} from "../../src/handlers/int-test-support/config-utils/get-synthetic-events-config-rows";
import {
  deleteS3Objects,
  getS3Objects,
  putS3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import path from "path";

const getDateElements = (
  date: Date
): { year: string; month: string; day: string } => {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = "01";
  return { year, month, day };
};

describe("\n Synthetic Events Generation Tests\n", () => {
  const { year, month, day } = getDateElements(new Date());
  const currentDateString = `${year}-${month}-${day}`;
  let syntheticEventsConfig: SyntheticEventsConfigRow[];
  const prefix = resourcePrefix();
  const storageBucket = `${prefix}-storage`;
  let testStartTime: Date;

  beforeAll(async () => {
    const key = "btm_extract_data/full-extract.json";
    const filePath = "../payloads/full-extract.txt";
    const filename = path.join(__dirname, filePath);
    const fileData = fs.readFileSync(filename).toString();
    // uploading the extract file to s3
    await putS3Object({
      data: fileData,
      encoding: "utf-8",
      target: {
        bucket: storageBucket,
        key,
      },
    });
    testStartTime = new Date();
    const result = await invokeSyntheticLambda();
    expect(result.statusCode).toBe(200);
    syntheticEventsConfig = await getSyntheticEventsConfig();
  });

  test("should validate the fixed synthetic events in the transaction_standardised table contain all required fields when the current date is greater than start date", async () => {
    const queryString = `SELECT * FROM "btm_transactions_standardised" where vendor_id = '${syntheticEventsConfig[0].vendor_id}' AND event_name='${syntheticEventsConfig[0].event_name}' AND year='${year}' AND month='${month}'`;
    const queryResults = await queryAthena<TransactionsStandardised>(
      queryString
    );
    expect(queryResults.length).toBe(1);
    expect(queryResults[0].vendor_id).toEqual(
      syntheticEventsConfig[0].vendor_id
    );
    expect(queryResults[0].event_id).toBeDefined();
    expect(queryResults[0].component_id).toEqual(
      syntheticEventsConfig[0].component_id
    );
    expect(queryResults[0].credits).toEqual(
      syntheticEventsConfig[0].quantity.toString()
    );
    expect(queryResults[0].year).toEqual(year);
    expect(queryResults[0].month).toEqual(month);
    const eventDateString = queryResults[0].timestamp.slice(0, 10);
    expect(eventDateString).toEqual(currentDateString);
    expect(queryResults[0].timestamp_formatted).toEqual(currentDateString);
  });

  afterAll(async () => {
    const folderPrefix = `btm_event_data/${year}/${month}/${day}/`;
    const s3Objects = await getS3Objects(
      { bucketName: storageBucket, prefix: folderPrefix },
      testStartTime
    );
    for (const s3Object of s3Objects) {
      const parsedObject = JSON.parse(s3Object);
      if (
        parsedObject.vendor_id === syntheticEventsConfig[0].vendor_id &&
        parsedObject.event_name === syntheticEventsConfig[0].event_name
      ) {
        const event_id = parsedObject.event_id;
        const objKey = `${folderPrefix}${event_id}.json`;
        await deleteS3Objects({ bucket: storageBucket, keys: [objKey] });
      }
    }
  });
});

export type TransactionsStandardised = {
  vendor_id: string;
  event_id: string;
  event_name: string;
  timestamp: string;
  timestamp_formatted: string;
  component_id: string;
  credits: number;
  year: string;
  month: string;
};
