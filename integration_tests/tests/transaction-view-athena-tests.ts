import { resourcePrefix } from "../helpers/envHelper";
import {
  startQueryExecutionCommand,
  queryObject,
} from "../helpers/athenaHelper";

import {
  deleteS3Events,
  generatePublishAndValidateEvents,
  TimeStamps,
} from "../helpers/commonHelpers";
import { publishSNS } from "../helpers/snsHelper";

import {
  ClientId,
  EventName,
  prettyClientNameMap,
  prettyEventNameMap,
  snsInvalidEventNamePayload,
} from "../payloads/snsEventPayload";
import { deleteDirectoryRecursiveInS3 } from "../helpers/s3Helper";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;
const bucketName = `${prefix}-storage`;

describe("\nExecute athena transaction curated query to retrive price \n", () => {
  beforeAll(async () => {
    await deleteDirectoryRecursiveInS3(bucketName, "btm_transactions");
  });

  test.each`
    eventName                          | clientId     | numberOfTestEvents | unitPrice | eventTime
    ${"EVENT_1"} | ${"client1"} | ${2}               | ${1.23}   | ${TimeStamps.THIS_TIME_LAST_YEAR}
    ${"EVENT_1"} | ${"client2"} | ${2}               | ${2.5}    | ${TimeStamps.CURRENT_TIME}
    ${"EVENT_1"} | ${"client3"} | ${7}               | ${4.0}    | ${TimeStamps.CURRENT_TIME}
    ${"EVENT_6"}           | ${"client3"} | ${14}              | ${8.88}   | ${TimeStamps.CURRENT_TIME}
  `(
    "price retrived from transaction_curated athena view query should match with expected calculated price for $numberOfTestEvents",
    async ({
      eventName,
      clientId,
      numberOfTestEvents,
      unitPrice,
      eventTime,
    }) => {
      const expectedPrice = (numberOfTestEvents * unitPrice).toFixed(4);
      const eventIds = await generatePublishAndValidateEvents({
        numberOfTestEvents,
        eventName,
        clientId,
        eventTime,
      });
      const response = await queryResults({ clientId, eventName });
      await deleteS3Events(eventIds, eventTime);
      expect(response[0].price).toEqual(expectedPrice);
    }
  );

  test("no results returned from transaction_curated athena view query when the event payload has invalid eventName", async () => {
    await publishSNS(snsInvalidEventNamePayload);
    const queryRes = await queryResults({
      clientId: snsInvalidEventNamePayload.client_id,
      eventName: snsInvalidEventNamePayload.event_name,
    });
    expect(queryRes.length).not.toBeGreaterThan(0);
  });
});

async function queryResults({
  clientId,
  eventName,
}: {
  clientId: ClientId;
  eventName: EventName;
}): Promise<Array<{ price: number }>> {
  const prettyClientName = prettyClientNameMap[clientId];
  const prettyEventName = prettyEventNameMap[eventName];
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const curatedQueryString = `SELECT * FROM "btm_transactions_curated" WHERE vendor_name='${prettyClientName}' AND service_name='${prettyEventName}'`;
  const queryId = await startQueryExecutionCommand(
    databaseName,
    curatedQueryString
  );
  const results = await queryObject(queryId);
  return results;
}
