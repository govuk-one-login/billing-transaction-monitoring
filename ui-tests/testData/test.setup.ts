import { putS3Object } from "../helpers/s3Helper.js";
import { geJsonDataFromFile } from "../utils/extractTestDatajson.js";

const storageBucket = `di-btm-pr-368-storage`;

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
