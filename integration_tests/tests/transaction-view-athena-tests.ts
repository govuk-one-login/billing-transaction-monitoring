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
} from "../payloads/snsEventPayload";

const prefix = resourcePrefix();
const objectsPrefix = "btm_transactions";
const databaseName = `${prefix}-calculations`;
let details: any = [];

describe("\nExecute athena query to retrive transaction data\n", () => {
  test("price retrived from billing_curated athena view should matches with expected calculated price for 2 events", async () => {
    const expectedCalculatedPrice = 2 * 6.5; //fake_prices.csv indicates these should be charged at £6.50 each
    await generateTestEventsAndValidateEventExists(2,"IPV_PASSPORT_CRI_REQUEST_SENT","client3");
    const queryResults = await executeTransactionCuretedQuery();
    await deletS3Event();
  });

  test("price retrived from billing_curated athena view should matches with expected calculated price for 7 events", async () => {
    const expectedCalculatedPrice = 7 * 0.25; //fake_prices.csv indicates these should be charged at £6.50 each
    await generateTestEventsAndValidateEventExists(7,"IPV_PASSPORT_CRI_REQUEST_SENT","client3");
    const queryResults = await executeTransactionCuretedQuery();
    await deletS3Event();
  });

  test("price retrived from billing_curated athena view should matches with expected calculated price for 14 events", async () => {
    const expectedCalculatedPrice = 14 * 8.88; //fake_prices.csv indicates these should be charged at £6.50 each
    await generateTestEventsAndValidateEventExists(14,"IPV_PASSPORT_CRI_REQUEST_SENT","client3");
    const queryResults = await executeTransactionCuretedQuery();
    await deletS3Event();
  });

  test.only("should retrive  empty results upon executing billing_curated athena view query when the event payload has invalid eventName", async () => {
    await generateTestEventsAndValidateEventExists(1,"IPV_KBV_CRI_THIRD_PARTY_REQUEST_ENDED","client4");
    const queryResults = await executeTransactionCuretedQuery();
     expect(queryResults.length).not.toBeGreaterThan(0)
  });
});

async function generateTestEventsAndValidateEventExists(numberOfTestEvents: number,eventName:string,clientId:string): Promise<void> {
  for (let i = 0; i < numberOfTestEvents; i++) {
    snsValidEventPayload.event_name = eventName;
    snsValidEventPayload.event_id = generateRandomNumber();
    details.push(snsValidEventPayload.event_id);
    snsValidEventPayload.client_id = clientId;
    await publishSNS(snsValidEventPayload);

    const checkEventId = async () => {
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
    const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
    expect(eventIdExists).toBeTruthy();
  }
}

async function executeTransactionCuretedQuery() {
  const curatedQueryString = `SELECT * FROM "btm_transaction_curated"`;
  const crated_queryId = await startQueryExecutionCommand(
    databaseName,
    curatedQueryString
  );
  const curatedObjects = await queryObject(crated_queryId);
  const curatedQueryObjects = curatedObjects.map(
    (element: {
      vendor_name: string;
      service_name: string;
      price: number;
      quantity: number;
      month: string;
      year: string;
    }) => {
      return {
        price: element.price,
        vendor_name: element.vendor_name,
      };
    }
  );
  console.log(curatedQueryObjects);
  return curatedQueryObjects;
}

const deletS3Event = async () => {
  const bucketName = `${prefix}-storage`;
  const date = new Date().toISOString().slice(0, 10);
  console.log(date);
  for (let i = 0; i < details.length; i++) {
    console.log("btm_transactions/" + date + "/" + details[i] + ".json");
    await deleteObjectInS3(
      bucketName,
      "btm_transactions/" + date + "/" + details[i] + ".json"
    );
  }
  console.log("deleted the file from s3");
  return true;
};
