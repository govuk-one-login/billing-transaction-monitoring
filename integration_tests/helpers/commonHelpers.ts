import {
  generateRandomNumber,
  snsValidEventPayload,
} from "../payloads/snsEventPayload";
import { deleteObjectInS3, getS3ItemsList } from "./s3Helper";
import { publishSNS } from "./snsHelper";
import { resourcePrefix } from "../helpers/envHelper";

const prefix = resourcePrefix();
const objectsPrefix = "btm_transactions";


export const waitForTrue = async (
  predicate: Function,
  delayMS: number,
  timeoutMS: number
): Promise<boolean> => {
  let intervalHandle: any;
  return await new Promise((resolve) => {
    const complete = (result: boolean): void => {
      clearInterval(intervalHandle);
      resolve(result);
    };
    const callPredicateAndComplete = async (): Promise<void> => {
      (await predicate()) && complete(true);
    };
    intervalHandle = setInterval(() => {
      void callPredicateAndComplete();
    }, delayMS);
    setTimeout(() => complete(false), timeoutMS);
  });
}
const details: string[] = [];

export const generateTestEvents = async (eventName:string,
  clientId:string): Promise<Object> => {

    snsValidEventPayload.event_name = eventName;
    snsValidEventPayload.event_id = generateRandomNumber();
    details.push(snsValidEventPayload.event_id); // storing event_ids in array to delete from s3 later on
    snsValidEventPayload.client_id = clientId;
    return snsValidEventPayload;
};

export const publishAndValidateEvents = async(events: object) => {
  await publishSNS(events);
  const checkEventId = async (): Promise<boolean> => {
    const result = await getS3ItemsList(`${prefix}-storage`, objectsPrefix);
    if (result.Contents === undefined) {
      console.log("Storage bucket contents empty");
      return false;
    }
    return JSON.stringify(result.Contents.map((data) => data.Key)).includes(
      snsValidEventPayload.event_id
    );
  };
  const eventIdExists = await waitForTrue(checkEventId, 1000, 10000);
  expect(eventIdExists).toBeTruthy();
}

export const deleteS3Event = async(): Promise<boolean> =>{
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
}