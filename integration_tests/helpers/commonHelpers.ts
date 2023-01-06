import {
  ClientId,
  SNSEventPayload,
  EventName,
} from "../payloads/snsEventPayload";
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

export const thisTimeLastYear = (): number => {
  return Math.floor((new Date().getTime() - 365 * 24 * 60 * 60 * 1000) / 1000);
};

export const eventTimeStamp = {
  THIS_TIME_LASTYEAR: thisTimeLastYear(),
  CURRENT_TIME: validTimestamp(),
};

export const waitForTrue = async (
  predicate: () => Promise<boolean | undefined | Object[]>,
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
      ((await predicate()) as boolean) && complete(true);
    };
    intervalHandle = setInterval(() => {
      void callPredicateAndComplete();
    }, delayMS);
    setTimeout(() => complete(false), timeoutMS);
  });
};

export const generateTestEvent = async (
  overrides: Partial<SNSEventPayload> &
    Pick<SNSEventPayload, "event_name" | "client_id">
): Promise<SNSEventPayload> => ({
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  ...overrides,
});

export const publishAndValidateEvent = async (
  event: SNSEventPayload
): Promise<void> => {
  await publishSNS(event);
  const checkEventId = async (): Promise<boolean> => {
    const result = await getS3ItemsList(`${prefix}-storage`, objectsPrefix);
    if (result.Contents === undefined) {
      console.log("Storage bucket contents empty");
      return false;
    }
    return result.Contents.some((data) => data.Key?.match(event.event_id));
  };
  const eventIdExists = await waitForTrue(checkEventId, 1000, 10000);
  expect(eventIdExists).toBeTruthy();
};

export const generatePublishAndValidateEvents = async ({
  numberOfTestEvents,
  eventName,
  clientId,
  eventTime,
}: {
  numberOfTestEvents: number;
  eventName: EventName;
  clientId: ClientId;
  eventTime: string;
}): Promise<string[]> => {
  const eventIds: string[] = [];
  for (let i = 0; i < numberOfTestEvents; i++) {
    const event = await generateTestEvent({
      client_id: clientId,
      event_name: eventName,
      timestamp: eventTimeStamp[eventTime as keyof typeof eventTimeStamp],
    });
    await publishAndValidateEvent(event);
    eventIds.push(event.event_id); // storing event_ids in array to delete from s3 later on
  }
  return eventIds;
};

export const deleteS3Event = async (
  eventId: string,
  eventTime: string
): Promise<boolean> => {
  const bucketName = `${prefix}-storage`;
  const key = eventTime;
  const date = new Date(
    eventTimeStamp[key as keyof typeof eventTimeStamp] * 1000
  )
    .toISOString()
    .slice(0, 10);
  await deleteObjectInS3({
    bucket: bucketName,
    key: `btm_transactions/${date}/${eventId}.json`,
  });
  console.log("deleted the file from s3");
  return true;
};

export const deleteS3Events = async (
  eventIds: string[],
  eventTime: string
): Promise<boolean> => {
  for (const eventId of eventIds) {
    await deleteS3Event(eventId, eventTime);
  }
  console.log("deleted the files from s3");
  return true;
};
