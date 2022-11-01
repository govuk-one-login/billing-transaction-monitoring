/**
 * This script pulls together the different parts of the template.yaml SAM file.
 */

import { Composer, Parser, Scalar, visit, parseDocument } from "yaml";
import { readFileSync, writeFileSync } from "fs";

const sourceFile = readFileSync("./template-source.yaml", "utf8");
const parser = new Parser();

const composer = new Composer();
const [document] = composer.compose(parser.parse(sourceFile));

const visitor = (key, node) => {
  if (node.tag === "!YAMLInclude") {
    const files = node.value.split(",");
    let fullContents;
    files.forEach((fileName) => {
      const file = readFileSync(`./${fileName.trim()}`, "utf8");
      const contents = parseDocument(file).contents;
      if (!fullContents) {
        fullContents = contents;
      } else {
        fullContents.items.push(...contents.items);
      }
    });

    if (node.tag === "!JSONTextInclude") {
      const file = readFileSync(`./${node.value.trim()}`, "utf8");
      const yamlObject = new Scalar(file);
      return yamlObject;
    }

    return fullContents;
  }
};
visit(document, visitor);

const outputContent = document.toString();
writeFileSync("./template.yaml", outputContent);
