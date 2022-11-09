/**
 * This script builds samconfig.toml and appends parameters to specified strings
 *
 * To do this:
 *   1. put `#!AddParameters` at the end of any lines with string values in samconfig-source.toml
 *   2. run `node src/tools/samconfig-add-parameters.js key1=value1,key2=value2` from the project root
 *
 */

import { readFileSync, writeFileSync } from "fs";

const inputParametersString = process.argv[2];

const file = readFileSync("./samconfig-source.toml", "utf8");

const lines = file.split("\n").map((line) => {
  const [code, ...commentParts] = line.split("#");
  const firstCommentWord = commentParts[0]?.trim().split(" ")[0];

  if (
    firstCommentWord?.toLowerCase() !== "!addparameters" ||
    !inputParametersString
  )
    return code;

  const trimmedCode = code.trimEnd();

  if (trimmedCode[trimmedCode.length - 1] !== '"') {
    console.error(
      'Invalid SAM config source file. !AddParameters command must be on line ending with: "'
    );

    process.exit(1);
  }

  const outputParametersString = inputParametersString
    .replace(",", " ")
    .replace('"', '\\"');

  const trimmedCodeWithoutFinalChar = trimmedCode.slice(
    0,
    trimmedCode.length - 1
  );

  return `${trimmedCodeWithoutFinalChar} ${outputParametersString}"`;
});

const outputContent = lines.join("\n");

writeFileSync("./samconfig.toml", outputContent);
