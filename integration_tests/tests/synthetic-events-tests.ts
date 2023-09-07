import { invokeSyntheticLambda } from "../../src/handlers/int-test-support/helpers/lambdaHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { deleteS3ObjectsAndPoll } from "../../src/handlers/int-test-support/helpers/testSetup";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  getSyntheticEventsConfig,
  SyntheticEventsConfigRow,
} from "../../src/handlers/int-test-support/config-utils/get-synthetic-events-config-rows";
import { TransactionCurated } from "./transaction-view-athena-tests";

describe("\n Synthetic Events Generation Tests\n", () => {
  const currentDate = new Date();
  const year = String(currentDate.getFullYear());
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const afterLambdaInvokeTime = new Date();
  let syntheticEventsConfig: SyntheticEventsConfigRow[];

  beforeAll(async () => {
    const prefix = resourcePrefix();
    const storageBucket = `${prefix}-storage`;
    const folderPrefix = `btm_event_data/${year}/${month}/${day}/`;
    await deleteS3ObjectsAndPoll(storageBucket, folderPrefix);
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
    expect(new Date(queryResults[0].timestamp).getTime()).toBeLessThanOrEqual(
      afterLambdaInvokeTime.getTime()
    );
    expect(
      new Date(queryResults[0].timestamp_formatted).getTime()
    ).toBeLessThanOrEqual(afterLambdaInvokeTime.getTime());
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
