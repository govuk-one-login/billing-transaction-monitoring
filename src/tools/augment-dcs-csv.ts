import { program } from "commander";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

program
  .name("augment-dcs-csv")
  .description("Adds necessary elements to csvs taken from DCS")
  .version("1.0.0");

program.requiredOption(
  "-i, --input <path>",
  "Path to the file to be augmented"
);
program.requiredOption(
  "-en, --event_name <string>",
  "The event name to be attached"
);
program.requiredOption(
  "-cid, --component_id <string>",
  "The component ID to be attached"
);
program.requiredOption(
  "-vid, --vendor_id <string>",
  "The event name to be attached"
);

program.parse(process.argv);

const { input, event_name, component_id, vendor_id } = program.opts();

const filePath = join(process.cwd(), input);
const fileBuffer = readFileSync(filePath);
const fileString = fileBuffer.toString();

const augmentedSegment = `${event_name},${component_id},${vendor_id}`;

const [eventIds, dateStrings] = fileString
  .split(/,|\n/)
  .reduce<[string[], string[]]>(
    (acc, cur, i) => {
      acc[i % 2].push(cur);
      return acc;
    },
    [[], []]
  );

writeFileSync(
  filePath.replace(/.csv$/i, "-augmented.csv"),
  dateStrings.reduce<string>(
    (acc, dateString, i) =>
      `${acc}${eventIds[i]},${dateString},${new Date(
        dateString
      ).getTime()},${augmentedSegment}\n`,
    "event_id,timestamp_formatted,timestamp,event_name,component_id,vendor_id\n"
  )
);
