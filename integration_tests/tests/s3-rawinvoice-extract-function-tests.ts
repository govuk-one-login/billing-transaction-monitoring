import { putObjectToS3, deleteObjectInS3 } from "../helpers/s3Helper";
import { checkGivenStringExistsInLogs } from "../helpers/cloudWatchHelper";
import path from "path";
import fs from "fs";

const testStartTime = new Date().getTime();

describe("\n Upload file to s3 bucket and validate extract lambda executed successfully \n", () => {
  const bucketName = `${process.env.ENV_PREFIX}-raw-invoice-pdf`;
  const key = "payloads/sample.pdf";

  afterAll(async () => {
    await deleteObjectInS3(bucketName, key);
    console.log("deleted the file from s3");
  });

  test("extract lambda function should be executed without errors upon uploading the file to s3 raw invoice pdf bucket", async () => {
    const file = "../payloads/sample.pdf";
    const filename = path.join(__dirname, file);
    const fileStream = fs.createReadStream(filename);
    const response = await putObjectToS3(bucketName, key, fileStream);
    expect(response.$metadata.httpStatusCode).toEqual(200);
    console.log("successfully uploaded the file to s3");
    const givenStringExistsInLogs = await checkGivenStringExistsInLogs(
      `${process.env.ENV_PREFIX}-extract-function`,
      "ERROR",
      testStartTime
    );
    expect(givenStringExistsInLogs).toBeFalsy();
  });
});
