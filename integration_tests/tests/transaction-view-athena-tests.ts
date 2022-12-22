import { resourcePrefix } from "../helpers/envHelper";
import {
  startQueryExecutionCommand,
  queryObject,
} from "../helpers/athenaHelper";
import { getS3ItemsList, deleteObjectInS3 } from "../helpers/s3Helper";
import { waitForTrue } from "../helpers/commonHelpers";
import { publishSNS } from "../helpers/snsHelper";
import {
  snsValidEventPayload,
  generateRandomNumber,
  snsInvalidEventNamePayload,
} from "../payloads/snsEventPayload";

const prefix = resourcePrefix();
const objectsPrefix = "btm_transactions";
const databaseName = `${prefix}-calculations`;
const details: string[] = [];

describe("\nExecute athena query to retrive transaction data\n", () => {
  test("price retrived from billing_curated athena view should matches with expected calculated price for 2 events", async () => {
    const expectedCalculatedPrice = (2 * 6.5).toFixed(4); // fake_prices.csv indicates these should be charged at £6.50 each
   await generateTestEventsAndValidateEventExists(
      2,
      "IPV_ADDRESS_CRI_END",
      "client3"
    );
    const response: {[key: string]: any} = await queryResults();
    expect(expectedCalculatedPrice).toEqual(response[0].price);
  });

  test("price retrived from billing_curated athena view should matches with expected calculated price for 7 events", async () => {
    const expectedCalculatedPrice = (7 * 0.25).toFixed(4); // fake_prices.csv indicates these should be charged at £0.25 each
    await generateTestEventsAndValidateEventExists(
      7,
      "IPV_ADDRESS_CRI_END",
      "client3"
    );
    const response: {[key: string]: any} = await queryResults();
   expect(expectedCalculatedPrice).toEqual(response[0].price);
  });

  test("price retrived from billing_curated athena view should matches with expected calculated price for 14 events", async () => {
    const expectedCalculatedPrice = (14 * 8.88).toFixed(4); // fake_prices.csv indicates these should be charged at £8.88 each
    await generateTestEventsAndValidateEventExists(
      14,
      "IPV_ADDRESS_CRI_END",
      "client3"
    );
    const response: {[key: string]: any} = await queryResults();
    expect(expectedCalculatedPrice).toEqual(response[0].price);
  });

  test("should retrive empty results upon executing billing_curated athena view query when the event payload has invalid eventName", async () => {
     await publishSNS(snsInvalidEventNamePayload);
    const queryRes = await queryResults();
    expect(queryRes.length).not.toBeGreaterThan(0);
  });

  afterEach(async () => {
    await deletS3Event();
    console.log("Deleted s3 events after each test");
  });
});

async function generateTestEventsAndValidateEventExists(
  numberOfTestEvents: number,
  eventName: string,
  clientId: string
): Promise<void> {
  for (let i = 0; i < numberOfTestEvents; i++) {
    snsValidEventPayload.event_name = eventName;
    snsValidEventPayload.event_id = generateRandomNumber();
    details.push(snsValidEventPayload.event_id); // storing event_ids in array to delete from s3 later on
    snsValidEventPayload.client_id = clientId;
    await publishSNS(snsValidEventPayload);

    const checkEventId = async (): Promise<boolean> => {
      const result = await getS3ItemsList(`${prefix}-storage`, objectsPrefix);
      if (result.Contents !== undefined) {
        return JSON.stringify(result.Contents.map((data) => data.Key)).includes(
          snsValidEventPayload.event_id
        );
      } else {
        console.log("Storage bucket contents empty");
        return false;
      }
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 10000);
    expect(eventIdExists).toBeTruthy();
  }
}



async function queryResults(): Promise<Object[]> {
  const curatedQueryString = `SELECT * FROM "btm_transactions_curated"`;
  const queryId = await startQueryExecutionCommand(
    databaseName,
    curatedQueryString
  );
  const results = await queryObject(queryId);
  return results;
}


const deletS3Event = async (): Promise<boolean> => {
  const bucketName = `${prefix}-storage`;
  const date = new Date().toISOString().slice(0, 10);
  for (let i = 0; i < details.length; i++) {
    await deleteObjectInS3(
      bucketName,
      `btm_transactions/${date}/${details[i]}.json` 
    );
  }
  console.log("deleted the file from s3");
  return true;
};
