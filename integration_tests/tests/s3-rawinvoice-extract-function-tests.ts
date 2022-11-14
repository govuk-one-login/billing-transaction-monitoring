import { putObjectToS3 } from "../helpers/s3Helper";
import { checkGivenStringExistsInLogs } from "../helpers/cloudWatchHelper";
import path from 'path'
import fs from "fs"

describe("\n Upload file to s3 bucket and validate extract lambda executed successfully \n", () => {
  test("should extraction function triggered upon uploading file to s3 raw invoice pdf bucket", async () => {
    const bucketNameMatchString = "di-btm-rawinvoicepdfbucket";
    const key = "payloads/sample.pdf";
    const file = "../payloads/sample.pdf";
    const filename = path.join(__dirname, file);
    const fileStream: any = fs.createReadStream(filename);
     await putObjectToS3(bucketNameMatchString, key, fileStream);
    const givenStringExistsInLogs = await checkGivenStringExistsInLogs(
      "di-btm-ExtractFunction-",
      "START"
    );
    expect(givenStringExistsInLogs).toBeTruthy();
  });
});
