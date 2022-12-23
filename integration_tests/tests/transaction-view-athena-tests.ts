import { resourcePrefix } from "../helpers/envHelper";
import {
  startQueryExecutionCommand,
  queryObject,
  } from "../helpers/athenaHelper";

import {
  deleteS3Event,
  generateTestEventsAndValidateEventExists,
  } from "../helpers/commonHelpers";
import { publishSNS } from "../helpers/snsHelper";
import { snsInvalidEventNamePayload } from "../payloads/snsEventPayload";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;

describe("\nExecute athena query to retrive transaction data\n", () => {
  test("price retrived from billing_curated athena view query should match with expected calculated price for 2 events", async () => {
    const expectedCalculatedPrice = (2 * 6.5).toFixed(4); // fake_prices.csv indicates these should be charged at £6.50 each
    await generateTestEventsAndValidateEventExists(
      2,
      "IPV_ADDRESS_CRI_END",
      "client3"
    );
    const response = await queryResults();
    expect(expectedCalculatedPrice).toEqual(response[0].price);
  });

  test("price retrived from billing_curated athena view query should match with expected calculated price for 7 events", async () => {
    const expectedCalculatedPrice = (7 * 0.25).toFixed(4); // fake_prices.csv indicates these should be charged at £0.25 each
    await generateTestEventsAndValidateEventExists(
      7,
      "IPV_ADDRESS_CRI_END",
      "client3"
    );
    const response = await queryResults();
    expect(expectedCalculatedPrice).toEqual(response[0].price);
  });

  test("price retrived from billing_curated athena view query should match with expected calculated price for 14 events", async () => {
    const expectedCalculatedPrice = (14 * 8.88).toFixed(4); // fake_prices.csv indicates these should be charged at £8.88 each
    await generateTestEventsAndValidateEventExists(
      14,
      "IPV_ADDRESS_CRI_END",
      "client3"
    );
    const response = await queryResults();
    expect(expectedCalculatedPrice).toEqual(response[0].price);
  });

  test("no results returned from billing_curated athena view query when the event payload has invalid eventName", async () => {
    await publishSNS(snsInvalidEventNamePayload);
    const queryRes = await queryResults();
    expect(queryRes.length).not.toBeGreaterThan(0);
  });

  afterEach(async () => {
    await deleteS3Event();
    console.log("Deleted s3 events after each test");
  });
});

async function queryResults(): Promise<Array<{ price: number }>> {
  const curatedQueryString = `SELECT * FROM "btm_transactions_curated"`;
  const queryId = await startQueryExecutionCommand(
    databaseName,
    curatedQueryString
  );
  const results = await queryObject(queryId);
  return results;
}
