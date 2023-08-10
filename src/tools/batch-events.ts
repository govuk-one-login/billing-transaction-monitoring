import { mkdirSync, readFileSync, writeFileSync } from "fs";
import read from "fs-readdir-recursive";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const workingDir = fileURLToPath(import.meta.url).split("batch-events.ts")[0];

const downloadedEventsPath = path.join(workingDir, "downloaded-events");

const filePaths = read(downloadedEventsPath);

const data = filePaths.reduce<{
  [year: string]: { [month: string]: { [day: string]: string[] } };
}>((stringifiedEvents, filePath) => {
  const inputFileData = readFileSync(
    path.join(downloadedEventsPath, filePath)
  ).toString();
  const [year, month, day] = filePath.split("/");
  return {
    ...stringifiedEvents,
    [year]: {
      ...(stringifiedEvents?.[year] ?? {}),
      [month]: {
        ...(stringifiedEvents?.[year]?.[month] ?? {}),
        [day]: [
          ...(stringifiedEvents?.[year]?.[month]?.[day] ?? []),
          inputFileData,
        ],
      },
    },
  };
}, {});

const chunkArray = (arr: unknown[], maxChunkLength: number): unknown[][] => {
  return arr.reduce<unknown[][]>(
    (acc, elem) => {
      if (acc[0].length < maxChunkLength) {
        acc[0].push(elem);
      } else {
        acc.unshift([elem]);
      }
      return acc;
    },
    [[]]
  );
};

Object.entries(data).forEach(([year, yData]) => {
  Object.entries(yData).forEach(([month, mData]) => {
    console.log("batching year", year, "month", month);
    Object.entries(mData).forEach(([day, dData]) => {
      const dateDir = path.join(workingDir, "batched-events", year, month, day);
      mkdirSync(dateDir, { recursive: true });
      const chunks = chunkArray(dData, 500);
      chunks.forEach((chunk) => {
        writeFileSync(
          path.join(dateDir, `${crypto.randomUUID()}.json`),
          chunk.join("\n")
        );
      });
    });
  });
});
