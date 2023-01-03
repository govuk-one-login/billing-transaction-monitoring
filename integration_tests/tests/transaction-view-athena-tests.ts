import { resourcePrefix } from "../helpers/envHelper";
import {
  startQueryExecutionCommand,
  queryObject,
} from "../helpers/athenaHelper";

import { deleteS3Event } from "../helpers/commonHelpers";
import { publishSNS } from "../helpers/snsHelper";
import { snsInvalidEventNamePayload } from "../payloads/snsEventPayload";
import {
  generateTestEvent as generateTestEvent,
  publishAndValidateEvent as publishAndValidateEvent,
} from "../helpers/commonHelpers";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;

describe("\nExecute athena transaction curated query to retrive price \n", () => {
  test.each`
    event_name                         | client_id    | numberOfTestEvents | unitPrice
    ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client2"} | ${2}               | ${2.0}
    ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client3"} | ${7}               | ${4.0}
    ${"IPV_ADDRESS_CRI_END"}           | ${"client3"} | ${14}              | ${8.88}
  `(
    "price retrived from billing_curated athena view query should match with expected calculated price for $numberOfTestEvents",
    async ({ event_name, client_id, numberOfTestEvents, unitPrice }) => {
      const expectedPrice = (numberOfTestEvents * unitPrice).toFixed(4);
      for (let i = 0; i < numberOfTestEvents; i++) {
        const event = await generateTestEvent(event_name, client_id);
        await publishAndValidateEvent(event);
      }
      const response = await queryResults();
      expect(expectedPrice).toEqual(response[0].price);
      //await deleteS3Event();
    }
  );

  test("no results returned from billing_curated athena view query when the event payload has invalid eventName", async () => {
    await publishSNS(snsInvalidEventNamePayload);
    const queryRes = await queryResults();
    expect(queryRes.length).not.toBeGreaterThan(0);
    await deleteS3Event();
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
