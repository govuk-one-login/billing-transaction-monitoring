import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  deleteS3Objects,
  putS3Object,
  checkIfS3ObjectExists,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { readJsonDataFromFile } from "../utils/extractTestDatajson";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export const cleanAndUploadExtractFileForUITest = async (): Promise<void> => {
  const key = "btm_extract_data/full-extract.json";
  const filePath = "./ui-tests/testData/testData.txt";
  const content = readJsonDataFromFile(filePath);

  // wait two minutes for any extract function invocations to finish
  await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000));

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

  if (!objectExists) {
    throw new Error(
      `Failed to verify that the file was uploaded to ${storageBucket}/${key}`
    );
  }
};
