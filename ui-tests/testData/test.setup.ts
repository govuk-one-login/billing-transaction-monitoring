import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  deleteS3Objects,
  putS3Object,
  checkIfS3ObjectExists,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { readJsonDataFromFile } from "../utils/extractTestDatajson";
import { restartLambda } from "../../src/handlers/int-test-support/helpers/lambdaHelper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export const cleanAndUploadExtractFileForUITest = async (): Promise<void> => {
  const key = "btm_extract_data/full-extract.json";
  const filePath = "./ui-tests/testData/testData.txt";
  const content = readJsonDataFromFile(filePath);

  // deleting existing file with same key
  await deleteS3Objects({ bucket: storageBucket, keys: [key] });

  // uploading the file to s3
  await putS3Object({
    data: content,
    encoding: "utf-8",
    target: {
      bucket: storageBucket,
      key,
    },
  });

  // verifying that the file exists
  const objectExists = await checkIfS3ObjectExists({
    bucket: storageBucket,
    key,
  });

  if (objectExists) {
    await restartLambda(`${prefix}-frontend-function`);
  } else {
    throw new Error(
      `Failed to verify that the file was uploaded to ${storageBucket}/${key}`
    );
  }
};
