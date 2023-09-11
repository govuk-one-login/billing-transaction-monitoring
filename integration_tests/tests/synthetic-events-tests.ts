import { invokeSyntheticLambda } from "../../src/handlers/int-test-support/helpers/lambdaHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { deleteS3ObjectsAndPoll } from "../../src/handlers/int-test-support/helpers/testSetup";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  getSyntheticEventsConfig,
  SyntheticEventsConfigRow,
} from "../../src/handlers/int-test-support/config-utils/get-synthetic-events-config-rows";
import { TransactionCurated } from "./transaction-view-athena-tests";

const getDateElements = (
  date: Date
): { year: string; month: string; day: string } => {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return { year, month, day };
};

describe("\n Synthetic Events Generation Tests\n", () => {
  const { year, month, day } = getDateElements(new Date());
  const currentDateString = `${year}-${month}-${day}`;
  let syntheticEventsConfig: SyntheticEventsConfigRow[];

  beforeAll(async () => {
    const result = await invokeSyntheticLambda("");
    expect(result.statusCode).toBe(200);
    syntheticEventsConfig = await getSyntheticEventsConfig();
  });

  test("should validate the events in the transaction_standardised table contain all required fields when the current date is between start_date and end_date", async () => {
    const queryString = `SELECT * FROM "btm_transactions_standardised" where vendor_id = '${syntheticEventsConfig[0].vendor_id}' AND event_name='${syntheticEventsConfig[0].event_name}'`;
    const queryResults = await queryAthena<Transactions_Standardised>(
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
    const {
      year: eventYear,
      month: eventMonth,
      day: eventDay,
    } = getDateElements(new Date(queryResults[0].timestamp));
    const eventDateString = `${eventYear}-${eventMonth}-${eventDay}`;
    expect(eventDateString).toEqual(currentDateString);
    expect(queryResults[0].timestamp_formatted).toEqual(currentDateString);
  });

  test("should validate the transaction_curated view  has expected synthetic quantity when the current date is between start_date and end_date", async () => {
    const queryString = `SELECT * FROM "btm_transactions_curated" where vendor_id = '${syntheticEventsConfig[0].vendor_id}' AND event_name='${syntheticEventsConfig[0].event_name}'`;
    const queryResults = (
      await queryAthena<TransactionCurated>(queryString)
    ).flat();
    expect(queryResults.length).toBe(1);
    expect(queryResults[0].quantity).toEqual(
      syntheticEventsConfig[0].quantity.toString()
    );
  });

  afterAll(async () => {
    const prefix = resourcePrefix();
    const storageBucket = `${prefix}-storage`;
    const folderPrefix = `btm_event_data/${year}/${month}/${day}/`;
    await deleteS3ObjectsAndPoll(storageBucket, folderPrefix);
  });
});

export type Transactions_Standardised = {
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
