import {
  PublishBatchRequestEntry,
  PublishCommandOutput,
} from "@aws-sdk/client-sns";
import { VendorId } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { batchPublishToTestTopic } from "../../src/handlers/int-test-support/helpers/snsHelper";

const makeMessages = (
  numberOfEvents: number,
  vendorId: VendorId,
  eventName: string,
  humanDate: string,
  timestampFormatted: string
): PublishBatchRequestEntry[] => {
  const events = [];
  for (let i = 0; i < numberOfEvents; i++) {
    events.push({
      Id: `Message_${vendorId}_${(10000 + i).toString(36)}_${
        new Date(humanDate).getTime() / 1000
      }`,
      Message: JSON.stringify({
        vendor_id: vendorId,
        component_id: "Test_COMP",
        event_id: `event_${vendorId}_${(10000 + i).toString(36)}_${
          new Date(humanDate).getTime() / 1000
        }`,
        timestamp: new Date(humanDate).getTime() / 1000,
        event_name: eventName,
        timestamp_formatted: timestampFormatted,
      }),
    });
  }
  console.log(events);
  return events;
};

const cases = [
  {
    vendor: VendorId.vendor_testvendor1,
    count: 11527,
    name: "VENDOR_1_EVENT_1",
    date: "2023/01/01 10:00",
    timeStampFormatted: "2023/01/01",
  },
  {
    vendor: VendorId.vendor_testvendor1,
    count: 18052,
    name: "VENDOR_1_EVENT_1",
    date: "2023/02/01 10:00",
    timeStampFormatted: "2023/02/01",
  },
  {
    vendor: VendorId.vendor_testvendor2,
    count: 15103,
    name: "VENDOR_2_EVENT_2",
    date: "2023/01/01 10:00",
    timeStampFormatted: "2023/01/01",
  },
  {
    vendor: VendorId.vendor_testvendor2,
    count: 38271,
    name: "VENDOR_2_EVENT_2",
    date: "2023/02/01 10:00",
    timeStampFormatted: "2023/02/01",
  },
  {
    vendor: VendorId.vendor_testvendor3,
    count: 5000,
    name: "VENDOR_3_EVENT_4",
    date: "2023/02/01 10:00",
    timeStampFormatted: "2023/02/01",
  },

  {
    vendor: VendorId.vendor_testvendor4,
    count: 9,
    name: "VENDOR_4_EVENT_5",
    date: "2023/01/01 10:00",
    timeStampFormatted: "2023/01/01",
  },
  {
    vendor: VendorId.vendor_testvendor4,
    count: 7,
    name: "VENDOR_4_EVENT_5",
    date: "2023/02/01 10:00",
    timeStampFormatted: "2023/02/01",
  },
];

export const chunkArray = <ArrayElem>(
  array: ArrayElem[],
  chunkSize: number
): ArrayElem[][] => {
  const chunks = [];
  const numberOfChunks = Math.ceil(array.length / chunkSize);
  for (let i = 0; i < numberOfChunks; i++) {
    chunks.push(array.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  return chunks;
};

const wait = async (ms: number): Promise<void> =>
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

describe("\nGENERATE EVENTS\n", () => {
  test("S3 EVENTS", async () => {
    const batchPromises = cases.reduce<
      Array<() => Promise<PublishCommandOutput>>
    >((acc, { vendor, count, name, date, timeStampFormatted }) => {
      const messages = makeMessages(
        count,
        vendor,
        name,
        date,
        timeStampFormatted
      );

      const chunkedMessages = chunkArray(messages, 10);
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const chunkPromises = chunkedMessages.map(
        (chunk) => async () => await batchPublishToTestTopic(chunk)
      );
      return [...acc, ...chunkPromises];
    }, []);

    for (const batchPromise of batchPromises) {
      await wait(100);
      await batchPromise();
    }
  });
});
