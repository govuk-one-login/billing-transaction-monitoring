import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper.js";
import { putS3Object } from "../helpers/s3Helper.js";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export const uploadExtractDataFileForUITest = async (): Promise<void> => {
  await putS3Object({
    data: "./ui-tests/pageobjects/testData.json",
    target: {
      bucket: storageBucket,
      key: `btm_extract_data/full-extract.json`,
    },
  });
};
