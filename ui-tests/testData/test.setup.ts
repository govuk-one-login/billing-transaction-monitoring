import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper.js";
import { putS3Object } from "../helpers/s3Helper.js";
import { geJsonDataFromFile } from "../helpers/extractDetailsTestDatajson.js";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export const uploadExtractDataFileForUITest = async (): Promise<void> => {
  const filePath = "./ui-tests/testData/testData.json";
  const content = geJsonDataFromFile(filePath);
  await putS3Object({
    data: content,
    target: {
      bucket: storageBucket,
      key: `btm_extract_data/full-extract.json`,
    },
  });
};
