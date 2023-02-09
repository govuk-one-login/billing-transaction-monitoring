import fs, { writeFileSync } from "fs";
import { join } from "path";
import {
  VendorId,
  EventName,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";

interface Message {
  vendor_id: VendorId;
  component_id: string;
  event_id: string;
  timestamp: number;
  event_name: EventName;
}

const makeMessages = (
  numberOfEvents: number,
  vendorId: VendorId,
  eventName: EventName,
  humanDate: string
): Message[] => {
  // prettier-ignore
  const events = []
  for (let i = 0; i < numberOfEvents; i++) {
    events.push({
      vendor_id: vendorId,
      component_id: "Test_COMP",
      event_id: `event_${vendorId}_${(10000 + i).toString(36)}_${
        new Date(humanDate).getTime() / 1000
      }`,
      timestamp: new Date(humanDate).getTime() / 1000,
      event_name: eventName,
    });
  }
  return events;
};

export type MakeDirectorySafely = (
  path: string,
  options?: { shouldEmpty: boolean }
) => void;

export const makeDirectorySafelyFactory =
  ({ mkdirSync, rmSync, statSync }: typeof fs): MakeDirectorySafely =>
  (path: string, { shouldEmpty } = { shouldEmpty: false }): void => {
    const stat = statSync(path, {
      throwIfNoEntry: false,
    });
    if (stat?.isDirectory() && !shouldEmpty) {
      return;
    } else if (stat?.isDirectory() && shouldEmpty) {
      rmSync(path, { recursive: true });
    }
    mkdirSync(path);
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

describe("\nGENERATE EVENTS\n", () => {
  test("S3 EVENTS", async () => {
    let batch: Message[] = [];
    cases.forEach(({ vendor, count, name, date }) => {
      const messages = makeMessages(count, vendor, name, date);
      batch = batch.concat(messages);

      writeFileSync(
        join(__dirname, `../payloads/messages.json`),
        JSON.stringify(batch)
      );

      // Write individual files for each event
      // makeDirectorySafelyFactory(fs)(
      //   join(
      //     __dirname,
      //     `../payloads/messages/${new Date(date).toISOString().split("T")[0]}`
      //   )
      // );
      // messages.forEach((message) => {
      //   writeFileSync(
      //     join(
      //       __dirname,
      //       `../payloads/messages/${
      //         new Date(date).toISOString().split("T")[0]
      //       }/${message.event_id}.json`
      //     ),
      //     JSON.stringify(message)
      //   );
      // });
    });
  });
});
