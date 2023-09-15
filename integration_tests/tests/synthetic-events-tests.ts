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
import { FullExtractData } from "../../src/handlers/int-test-support/types";

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
  let extractJson: FullExtractData[];

  beforeAll(async () => {
    const key = "btm_extract_data/full-extract.json";
    const filePath = "../payloads/full-extract-synthetic-events.txt";
    const filename = path.join(__dirname, filePath);
    const fileData = fs.readFileSync(filename).toString();
    const jsonArray = "[" + fileData.replace(/\n/g, ",") + "]";
    extractJson = JSON.parse(jsonArray);
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

  test("should generate synthetic events for missing events in the full extract", async () => {
    for (const config of syntheticEventsConfig) {
      const matchingExtractItem = findMatchingExtractItem(config, extractJson);
      if (!matchingExtractItem) {
        await validateSyntheticEvent(config, matchingExtractItem);
      }
    }
  });

  test("should generate synthetic events when the quantity in the full extract is less than the synthetic config quantity", async () => {
    for (const config of syntheticEventsConfig) {
      const matchingExtractItem = findMatchingExtractItem(config, extractJson);
      if (
        matchingExtractItem &&
        Number(matchingExtractItem.transaction_quantity) < config.quantity
      ) {
        await validateSyntheticEvent(config, matchingExtractItem);
      }
    }
  });

  test("should not generate synthetic events when the event exists and the quantity in the extract matches with synthetic config quantity", async () => {
    for (const config of syntheticEventsConfig) {
      const matchingExtractItem = findMatchingExtractItem(config, extractJson);
      if (
        matchingExtractItem &&
        Number(matchingExtractItem.transaction_quantity) >= config.quantity
      ) {
        await validateSyntheticEvent(config, matchingExtractItem);
      }
    }
  });
});

const findMatchingExtractItem = (
  config: SyntheticEventsConfigRow,
  extractJson: FullExtractData[]
): FullExtractData | undefined => {
  const eventName =
    config.type === "shortfall"
      ? config.shortfall_event_name
      : config.event_name;
  return extractJson.find(
    (item) =>
      item.event_name === eventName && item.vendor_id === config.vendor_id
  );
};

const validateSyntheticEvent = async (
  config: SyntheticEventsConfigRow,
  matchingExtractItem: FullExtractData | undefined
): Promise<void> => {
  const eventName =
    config.type === "shortfall"
      ? config.shortfall_event_name
      : config.event_name;
  const { year, month } = getDateElements(new Date(config.start_date));

  const queryString = `SELECT * FROM "btm_transactions_standardised" WHERE vendor_id = '${config.vendor_id}'
  AND event_name='${eventName}' AND year='${year}' AND month='${month}'`;

  const queryResults = await queryAthena<TransactionsStandardised>(queryString);

  if (
    !matchingExtractItem ||
    Number(matchingExtractItem.transaction_quantity) < Number(config.quantity)
  ) {
    // validate when there is  no matching event in the extract or a shortfall
    expect(queryResults.length).toBe(1);
    const result = queryResults[0];
    expect(result.vendor_id).toEqual(config.vendor_id);
    expect(result.event_id).toBeDefined();
    expect(result.component_id).toEqual(config.component_id);
    const expectedCredits = matchingExtractItem
      ? Number(config.quantity) -
        Number(matchingExtractItem.transaction_quantity)
      : Number(config.quantity);
    expect(result.credits).toEqual(expectedCredits.toString());
    expect(result.timestamp.substring(0, 10)).toEqual(config.start_date);
    expect(result.timestamp_formatted).toEqual(config.start_date);
    expect(result.year).toEqual(year);
    expect(result.month).toEqual(month);
  } else {
    // validate when the event exists and the quantity in extract matches with config)
    expect(queryResults.length).toBe(0);
  }
};

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
