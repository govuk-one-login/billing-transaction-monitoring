import { BtmMonthlyExtract } from "../../integration_tests/tests/dashboard-data-extraction-tests";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";
import {
  deleteS3Objects,
  putS3Object,
  checkIfS3ObjectExists,
  listS3Objects,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { readJsonDataFromFile } from "../utils/extractTestDatajson";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export const cleanAndUploadExtractFileForUITest = async (): Promise<void> => {
  const key = "btm_extract_data/full-extract.json";
  const filePath = "./ui-tests/testData/testData.txt";
  const content = readJsonDataFromFile(filePath);

  // deleting existing file with same key
  await deleteS3Objects({ bucket: storageBucket, keys: [key] });

  await poll(
    async () =>
      await listS3Objects({
        bucketName: storageBucket,
        prefix,
      }),
    (s3Objects) => s3Objects.length === 0,
    {
      timeout: 80000,
      interval: 10000,
      notCompleteErrorMessage: `${prefix} folder could not be deleted because it still contains objects`,
    }
  );

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

  const queryString = `SELECT * FROM "btm_monthly_extract"`;
  const response = await queryAthena<BtmMonthlyExtract>(queryString);
  expect(response.length).toEqual(22);
  if (!objectExists) {
    throw new Error(
      `Failed to verify that the file was uploaded to ${storageBucket}/${key}`
    );
  }
};
