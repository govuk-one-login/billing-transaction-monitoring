import { Composer, Parser, visit, parseDocument } from 'yaml';
import { readFileSync, writeFileSync } from 'fs';

const sourceFile = readFileSync('./template-source.yaml', 'utf8');
let parser = new Parser();

let composer = new Composer();
let [document] = composer.compose(parser.parse(sourceFile));

let visitor = (key, node, path) => {
  if (node.tag && node.tag === '!YAMLInclude') {
    const files = node.value.split(',');
    let fullContents;
    files.forEach(fileName => {
      const file = readFileSync(`./${fileName.trim()}`, 'utf8');
      const contents = parseDocument(file).contents;
      if(!fullContents) {
        fullContents = contents;
      } else {
        fullContents.items.push(...contents.items);
      }
    })

    return fullContents;
  }
};
visit(document, visitor)

const outputContent = document.toString();
writeFileSync('./template.yaml', outputContent);
