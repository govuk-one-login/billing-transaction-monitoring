import { resourcePrefix } from "../helpers/envHelper";
import {
  startQueryExecutionCommand,
  queryObject,
  } from "../helpers/athenaHelper";

import {
  deleteS3Event,
  } from "../helpers/commonHelpers";
import { publishSNS } from "../helpers/snsHelper";
import { snsInvalidEventNamePayload } from '../payloads/snsEventPayload';
import { generateTestEvents, publishAndValidateEvents } from '../helpers/commonHelpers';

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;

describe("\nExecute athena query to retrive transaction data\n", () => {
  test("price retrived from billing_curated athena view query should match with expected calculated price for 2 events", async () => {
    const expectedCalculatedPrice = (2 * 3.99).toFixed(4);
    const numberofTestEvents = 2 // fake_prices.csv indicates these should be charged at £6.50 each
    for (let i = 0; i < numberofTestEvents; i++) {
    const events=  await generateTestEvents(
      "IPV_KBV_CRI_REQUEST_SENT",
      "client2" 
    );
    console.log(events)
    await publishAndValidateEvents(events)
    }
    const response = await queryResults();
    expect(expectedCalculatedPrice).toEqual(response[0].price);
    await deleteS3Event()
    });

  test("price retrived from billing_curated athena view query should match with expected calculated price for 7 events", async () => {
    const expectedCalculatedPrice = (7 * 4.00).toFixed(4); // fake_prices.csv indicates these should be charged at £0.25 each
    const numberofTestEvents = 7 
    for (let i = 0; i < numberofTestEvents; i++) {
    const events = await generateTestEvents(
      "IPV_PASSPORT_CRI_REQUEST_SENT",
      "client3"
    );
    console.log(events)
    await publishAndValidateEvents(events)
    }
    const response = await queryResults();
    expect(expectedCalculatedPrice).toEqual(response[0].price);
    await deleteS3Event()
  });

  test("price retrived from billing_curated athena view query should match with expected calculated price for 14 events", async () => {
    const expectedCalculatedPrice = (14 * 8.88).toFixed(4); // fake_prices.csv indicates these should be charged at £8.88 each
    const numberofTestEvents = 14 
    for (let i = 0; i < numberofTestEvents; i++) {
    const events = await generateTestEvents(
      "IPV_ADDRESS_CRI_END",
      "client3"
    );
    console.log(events)
    await publishAndValidateEvents(events)
    }
    const response = await queryResults();
    expect(expectedCalculatedPrice).toEqual(response[0].price);
    await deleteS3Event()
  });

  test("no results returned from billing_curated athena view query when the event payload has invalid eventName", async () => {
    await publishSNS(snsInvalidEventNamePayload);
    const queryRes = await queryResults();
    expect(queryRes.length).not.toBeGreaterThan(0);
    await deleteS3Event()
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