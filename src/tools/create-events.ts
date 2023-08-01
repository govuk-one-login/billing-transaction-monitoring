import crypto from "crypto";
import { mkdirSync, rmSync, statSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export interface FileSystem {
  mkdirSync: (dir: string) => void;
  statSync: (
    dir: string,
    opts?: { throwIfNoEntry?: boolean }
  ) => { isDirectory: () => boolean };
  readdirSync: (dir: string) => string[];
  readFileSync: (path: string) => Buffer;
  rmSync: (dir: string, opts: { recursive?: boolean }) => void;
  writeFileSync: (path: string, data: string) => void;
}

export interface Path {
  dirname: (path: string) => string;
  join: (...paths: string[]) => string;
  resolve: (dir: string, file: string) => string;
}

export type MakeDirectorySafely = (
  path: string,
  options?: { shouldEmpty: boolean }
) => void;

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
  const FIRST_MONTH = 1;
  const FIRST_YEAR = 2020;
  for (let day = 1; day <= 31; day++) {
    const dirPath = path.join(
      fileURLToPath(import.meta.url).split("create-events.ts")[0],
      "events",
      FIRST_YEAR.toString(),
      FIRST_MONTH.toString(),
      day.toString()
    );
    console.log("🚀 ~ file: create-events.ts:92 ~ dirPath:", dirPath);
    makeDirectorySafely(dirPath);
    for (
      let filesPerDay = 0;
      filesPerDay < Math.ceil(Math.random() * 4);
      filesPerDay++
    ) {
      const events = createEvents(FIRST_YEAR, FIRST_MONTH, day, 500);
      writeFileSync(
        path.join(dirPath, `${crypto.randomUUID()}.json`),
        events.join("\n")
      );
    }
  }
})();
