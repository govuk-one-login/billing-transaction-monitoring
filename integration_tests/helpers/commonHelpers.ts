import { ClientId, SNSEventPayload } from "../payloads/snsEventPayload";
import { deleteObjectInS3, getS3ItemsList } from "./s3Helper";
import { publishSNS } from "./snsHelper";
import { resourcePrefix } from "../helpers/envHelper";

const prefix = resourcePrefix();
const objectsPrefix = "btm_transactions";

export const generateRandomId = (): string => {
  return Math.floor(Math.random() * 10000000).toString();
};

export const validTimestamp = (): number => {
  return new Date().getTime() / 1000;
};

export const waitForTrue = async (
  predicate: () => Promise<boolean>,
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
};

export const generateTestEvent = async (
  eventName: string,
  clientId: ClientId
): Promise<SNSEventPayload> => {
  return {
    event_name: eventName,
    event_id: generateRandomId(),
    component_id: "TEST_COMP",
    timestamp: validTimestamp(),
    client_id: clientId,
  };
};

export const publishAndValidateEvent = async (
  event: SNSEventPayload
): Promise<void> => {
  console.log(
    "🚀 ~ file: commonHelpers.ts:61 ~ publishAndValidateEvents ~ events",
    event
  );
  await publishSNS(event);
  const checkEventId = async (): Promise<boolean> => {
    const result = await getS3ItemsList(`${prefix}-storage`, objectsPrefix);
    if (result.Contents === undefined) {
      console.log("Storage bucket contents empty");
      return false;
    }
    return result.Contents.map((data) => data.Key).includes(event.event_id);
  };
  const eventIdExists = await waitForTrue(checkEventId, 1000, 10000);
  expect(eventIdExists).toBeTruthy();
};

export const generatePublishAndValidateEvents = async ({
  numberOfTestEvents,
  eventName,
  clientId,
}: {
  numberOfTestEvents: number;
  eventName: string;
  clientId: ClientId;
}): Promise<string[]> => {
  const eventIds: string[] = [];
  for (let i = 0; i < numberOfTestEvents; i++) {
    const event = await generateTestEvent(eventName, clientId);
    await publishAndValidateEvent(event);
    eventIds.push(event.event_id); // storing event_ids in array to delete from s3 later on
    console.log("🚀 ~ file: commonHelpers.ts:44 ~ details", eventIds);
  }
  return eventIds;
};

export const deleteS3Event = async (eventId: string): Promise<boolean> => {
  const bucketName = `${prefix}-storage`;
  const date = new Date().toISOString().slice(0, 10);
  await deleteObjectInS3(
    bucketName,
    `btm_transactions/${date}/${eventId}.json`
  );
  console.log("deleted the file from s3");
  return true;
};

export const deleteS3Events = async (eventIds: string[]): Promise<boolean> => {
  for (const eventId of eventIds) {
    await deleteS3Event(eventId);
  }
  console.log("deleted the file from s3");
  return true;
};
