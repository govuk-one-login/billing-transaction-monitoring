import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { putS3Object } from "../../src/handlers/int-test-support/helpers/s3Helper";
import { readJsonDataFromFile } from "../utils/extractTestDatajson";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export const uploadExtractDataFileForUITest = async (): Promise<void> => {
  const filePath = "./ui-tests/testData/testData.json";
  const content = readJsonDataFromFile(filePath);
  await putS3Object({
    data: content,
    target: {
      bucket: storageBucket,
      key: `btm_extract_data/full-extract.json`,
    },
  });
};
