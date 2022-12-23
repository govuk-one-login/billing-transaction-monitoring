import { generateRandomNumber, snsValidEventPayload } from "../payloads/snsEventPayload";
import { deleteObjectInS3, getS3ItemsList } from "./s3Helper";
import { publishSNS } from "./snsHelper";
import { resourcePrefix } from "../helpers/envHelper";

const prefix = resourcePrefix();
const objectsPrefix = "btm_transactions";
const details: string[] = [];

async function waitForTrue(
  predicate: Function,
  delayMS: number,
  timeoutMS: number
): Promise<boolean> {
  let intervalHandle: any;
  return await new Promise((resolve) => {
    const complete = (result: boolean): void => {
      clearInterval(intervalHandle);
      resolve(result);
    };
    const callPredicateAndComplete = async (): Promise<void> => {
      (await predicate()) && complete(true)
    };
    intervalHandle = setInterval(() => {
      void callPredicateAndComplete();
    }, delayMS);
    setTimeout(() => complete(false), timeoutMS);
  });
}

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


async function deleteS3Event(): Promise<boolean> {
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


export { waitForTrue, deleteS3Event, generateTestEventsAndValidateEventExists  };
