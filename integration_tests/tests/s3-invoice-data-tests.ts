import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { listS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";

const prefix = resourcePrefix();

describe("\n Invoice data buckets exists in S3\n", () => {
  test("Raw invoice bucket should exists in S3", async () => {
    const response = await listS3Objects({
      bucketName: `${prefix}-raw-invoice`,
    });
    expect(response).toBeTruthy();
  });

  test("Raw invoice textract data bucket should exists in S3", async () => {
    const response = await listS3Objects({
      bucketName: `${prefix}-raw-invoice-textract-data`,
    });
    expect(response).toBeTruthy();
  });

  test("Storage bucket should exists in S3", async () => {
    const response = await listS3Objects({ bucketName: `${prefix}-storage` });
    expect(response).toBeTruthy();
  });
});
