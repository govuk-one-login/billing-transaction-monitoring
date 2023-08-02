import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  deleteS3Objects,
  putS3Object,
  checkIfS3ObjectExists,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { readJsonDataFromFile } from "../utils/extractTestDatajson";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export const cleanAndUploadFileForUITest = async (): Promise<void> => {
  const key = "btm_extract_data/full-extract.json";
  const filePath = "./ui-tests/testData/testData.json";
  const content = readJsonDataFromFile(filePath);
  await deleteS3Objects({ bucket: storageBucket, keys: [key] });
  await putS3Object(
    {
      data: content,
      target: {
        bucket: storageBucket,
        key,
      },
    },
    "utf-8"
  );

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
