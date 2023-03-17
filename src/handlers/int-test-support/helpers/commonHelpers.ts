import { deleteS3Object, listS3Objects } from "./s3Helper";
import { publishToTestTopic } from "./snsHelper";
import { resourcePrefix } from "./envHelper";
import { EventName, SNSEventPayload } from "./payloadHelper";

const objectsPrefix = "btm_transactions";

export const generateRandomId = (): string => {
  return Math.floor(Math.random() * 10000000).toString();
};

export const validTimestamp = (): number => {
  return Math.floor(new Date().getTime() / 1000);
};

export const thisTimeLastYear = (): number => {
  return Math.floor((new Date().getTime() - 365 * 24 * 60 * 60 * 1000) / 1000);
};

export enum TimeStamps {
  THIS_TIME_LAST_YEAR,
  CURRENT_TIME,
}

export enum TableNames {
  BILLING_TRANSACTION_CURATED = "btm_billing_and_transactions_curated",
  TRANSACTION_CURATED = "btm_transactions_curated",
}

export const eventTimeStamp = {
  [TimeStamps.THIS_TIME_LAST_YEAR]: thisTimeLastYear(),
  [TimeStamps.CURRENT_TIME]: validTimestamp(),
};

export const poll = async <Resolution>(
  promise: () => Promise<Resolution>,
  completionCondition: (resolution: Resolution) => boolean,
  options?: {
    interval?: number;
    timeout?: number;
    nonCompleteErrorMessage?: string;
  }
): Promise<Resolution> => {
  const {
    interval = 1_000,
    timeout = 30_000,
    nonCompleteErrorMessage = "Polling completion condition was never achieved",
  } = options ?? {};
  return await new Promise((resolve, reject) => {
    // This timeout safely exits the function if the completion condition
    // isn't achieved within the given timeout
    const timeoutHandle = setTimeout(() => {
      clearInterval(intervalHandle);
      // Rejecting with a string rather than an error so that the failure
      // bubbles up to the test, giving better output
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(nonCompleteErrorMessage);
    }, timeout);
    // using a stack even though we only intend to have one promise at a time
    // because we can synchronously measure the length of an array
    // but we can't synchronously check the status of a promise
    const promiseStack: Array<Promise<Resolution>> = [];
    const intervalHandle = setInterval(() => {
      // don't create new promises if we've still got a promise in flight
      if (promiseStack.length > 0) return;
      // enqueue a new promise
      promiseStack.push(promise());
      Promise.all(promiseStack).then(
        (responses) => {
          // dequeue the last promise
          void promiseStack.pop();
          responses.forEach((response) => {
            const isComplete = completionCondition(response);
            // if one of the responses in the stack is the one we want
            // then clear down and resolve to that response
            if (isComplete) {
              clearInterval(intervalHandle);
              clearTimeout(timeoutHandle);
              resolve(response);
            }
          });
        },
        (error) => {
          // if the underlying promise rejects then we stop polling,
          // clear down and pass the rejection up
          clearInterval(intervalHandle);
          clearTimeout(timeoutHandle);
          reject(error);
        }
      );
    }, interval);
  });
};
export const generateTestEvent = async (
  overrides: Partial<SNSEventPayload> & Pick<SNSEventPayload, "event_name">
): Promise<SNSEventPayload> => ({
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp(),
  timestamp_formatted: JSON.stringify(new Date(validTimestamp())),
  ...overrides,
});

export const publishAndValidateEvent = async (
  event: SNSEventPayload
): Promise<void> => {
  await publishToTestTopic(event);
  await poll(
    async () =>
      await listS3Objects({
        bucketName: `${resourcePrefix()}-storage`,
        prefix: objectsPrefix,
      }),
    (result) =>
      !!result?.Contents?.some((data) => data.Key?.match(event.event_id))
  );
};

export const generatePublishAndValidateEvents = async ({
  numberOfTestEvents,
  eventName,
  eventTime,
}: {
  numberOfTestEvents: number;
  eventName: EventName;
  eventTime: TimeStamps;
}): Promise<string[]> => {
  const eventIds: string[] = [];
  for (let i = 0; i < numberOfTestEvents; i++) {
    const event = await generateTestEvent({
      event_name: eventName,
      timestamp: eventTimeStamp[eventTime],
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
  const bucketName = `${resourcePrefix()}-storage`;
  const date = new Date(eventTime).toISOString().slice(0, 10);
  await deleteS3Object({
    bucket: bucketName,
    key: `btm_transactions/${date}/${eventId}.json`,
  });
  return true;
};

export const deleteS3Events = async (
  eventIds: string[],
  eventTime: string
): Promise<boolean> => {
  for (const eventId of eventIds) {
    await deleteS3Event(eventId, eventTime);
  }
  return true;
};
