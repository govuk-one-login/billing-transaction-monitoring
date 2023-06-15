import { fetchS3 } from "../shared/utils";

const arg = process.argv[process.argv.length - 1];

const [bucketName, ...filePathParts] = arg.split("/");

if (filePathParts.length === 0)
  throw Error("Expected argument format `bucket-name/path/to/file`");

const filePath = filePathParts.join("/");

const fileText = await fetchS3(bucketName, filePath);

console.log(fileText);
