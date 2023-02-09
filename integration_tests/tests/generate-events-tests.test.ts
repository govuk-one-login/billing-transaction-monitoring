import {
  PublishBatchRequestEntry,
  PublishCommandOutput,
} from "@aws-sdk/client-sns";
import {
  VendorId,
  EventName,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { batchPublishToTestTopic } from "../../src/handlers/int-test-support/helpers/snsHelper";

const makeMessages = (
  numberOfEvents: number,
  vendorId: VendorId,
  eventName: EventName,
  humanDate: string
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
      }),
    });
  }
  return events;
};

const cases = [
  {
    vendor: VendorId.vendor_testvendor1,
    count: 11598,
    name: EventName.EVENT_1,
    date: "2023/01/01 10:00",
  },
  {
    vendor: VendorId.vendor_testvendor1,
    count: 18052,
    name: EventName.EVENT_1,
    date: "2023/02/01 10:00",
  },
  {
    vendor: VendorId.vendor_testvendor2,
    count: 15263,
    name: EventName.EVENT_1,
    date: "2023/01/01 10:00",
  },
  {
    vendor: VendorId.vendor_testvendor2,
    count: 38271,
    name: EventName.EVENT_1,
    date: "2023/02/01 10:00",
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

describe("\nGENERATE EVENTS\n", () => {
  test("S3 EVENTS", async () => {
    const batchPromises = cases.reduce<Array<Promise<PublishCommandOutput>>>(
      (acc, { vendor, count, name, date }) => {
        const messages = makeMessages(count, vendor, name, date);

        const chunkedMessages = chunkArray(messages, 10);
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        const chunkPromises = chunkedMessages.map((chunk) =>
          batchPublishToTestTopic(chunk)
        );
        return [...acc, ...chunkPromises];
      },
      []
    );

    await Promise.all(batchPromises).then((resolutions) => {
      console.log(resolutions);
    });
  });
});
