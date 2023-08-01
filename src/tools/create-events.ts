import crypto from "crypto";
import { mkdirSync, rmSync, statSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const makeDirectorySafely = (
  path: string,
  { shouldEmpty } = { shouldEmpty: false }
): void => {
  const stat = statSync(path, {
    throwIfNoEntry: false,
  });
  if (stat?.isDirectory() && !shouldEmpty) {
    return;
  } else if (stat?.isDirectory() && shouldEmpty) {
    rmSync(path, { recursive: true });
  }
  mkdirSync(path, { recursive: true });
};

const createEvent = (date: Date): string => {
  const eventNumber = [1, 3, 4][Math.floor(Math.random() * 2)];
  return JSON.stringify({
    component_id: "TEST_COMP",
    user: {},
    event_name: `VENDOR_1_EVENT_${eventNumber}`,
    event_id: crypto.randomUUID(),
    vendor_id: "vendor_testvendor1",
    credits: Math.ceil(Math.random() * 2),
    timestamp: date.getTime(),
    timestamp_formatted: "2020-01-01 00:00:000Z",
  });
};

const createEvents = (
  year: number,
  month: number,
  day: number,
  quantity: number
): string[] => {
  const events = [];
  for (let i = 0; i < quantity; i++) {
    const date = new Date(
      year,
      month,
      day,
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 1000)
    );
    events.push(createEvent(date));
  }
  return events;
};

(() => {
  const FIRST_YEAR = 2019;
  for (let year = FIRST_YEAR; year <= FIRST_YEAR + 1; year++) {
    for (let month = 1; month <= 2; month++) {
      for (let day = 1; day <= 28; day++) {
        const dirPath = path.join(
          fileURLToPath(import.meta.url).split("create-events.ts")[0],
          "events",
          year.toString(),
          `0${month.toString()}`.slice(-2),
          `0${day.toString()}`.slice(-2)
        );
        makeDirectorySafely(dirPath, { shouldEmpty: true });
        for (
          let filesPerDay = 10;
          filesPerDay < 10 + Math.ceil(Math.random() * 20);
          filesPerDay++
        ) {
          const events = createEvents(year, month, day, 1);
          writeFileSync(
            path.join(dirPath, `${crypto.randomUUID()}.json`),
            events.join("\n")
          );
        }
      }
    }
  }
})();
