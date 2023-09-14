import { invokeSyntheticLambda } from "../../src/handlers/int-test-support/helpers/lambdaHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import fs from "fs";
import {
  getSyntheticEventsConfig,
  SyntheticEventsConfigRow,
} from "../../src/handlers/int-test-support/config-utils/get-synthetic-events-config-rows";
import { putS3Object } from "../../src/handlers/int-test-support/helpers/s3Helper";
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
  const prefix = resourcePrefix();
  const storageBucket = `${prefix}-storage`;
  let syntheticEventsConfig: SyntheticEventsConfigRow[];

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
    const result = await invokeSyntheticLambda();
    expect(result.statusCode).toBe(200);
    syntheticEventsConfig = await getSyntheticEventsConfig();
  });

  test("should validate the fixed synthetic events in the transaction_standardised table contain all required fields when the current date is greater than start date", async () => {
    const { year, month } = getDateElements(
      new Date(syntheticEventsConfig[0].start_date)
    );
    const queryString = `SELECT * FROM "btm_transactions_standardised" where vendor_id = '${syntheticEventsConfig[0].vendor_id}' 
   OR vendor_id='${syntheticEventsConfig[2].vendor_id}' OR event_name='${syntheticEventsConfig[3].event_name}' OR event_name='${syntheticEventsConfig[3].event_name}' 
   OR event_name='${syntheticEventsConfig[0].event_name}'AND year='${year}' AND month='${month}' ORDER BY event_name asc`;
    console.log(queryString);
    const queryResults = await queryAthena<TransactionsStandardised>(
      queryString
    );
    console.log(queryResults);
    expect(queryResults.length).toBe(3);

    expect(queryResults[0].vendor_id).toEqual(
      syntheticEventsConfig[0].vendor_id
    );
    expect(queryResults[1].vendor_id).toEqual(
      syntheticEventsConfig[2].vendor_id
    );
    expect(queryResults[2].vendor_id).toEqual(
      syntheticEventsConfig[3].vendor_id
    );
    expect(queryResults[0].event_id).toBeDefined();
    expect(queryResults[0].component_id).toEqual(
      syntheticEventsConfig[0].component_id
    );
    expect(queryResults[0].credits).toEqual("7"); // fixed events
    expect(queryResults[1].credits).toEqual("5"); // shortfall monthly events
    expect(queryResults[2].credits).toEqual("2"); // shortfall quarterly
    expect(queryResults[0].year).toEqual(year);
    expect(queryResults[0].month).toEqual(month);
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
