import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { putS3Object } from "../../src/handlers/int-test-support/helpers/s3Helper";
import { geJsonDataFromFile } from "../utils/extractTestDatajson";
import { DASHBOARD_EXTRACT_PATH } from "../../src/shared/constants";
import { TEST_DATA_FILE_PATH } from "../utils/constants";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export const uploadExtractDataFileForUITest = async (): Promise<void> => {
  const content = geJsonDataFromFile(TEST_DATA_FILE_PATH);
  await putS3Object({
    data: content,
    target: {
      bucket: storageBucket,
      key: DASHBOARD_EXTRACT_PATH,
    },
  });
};
