import { listS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";
import {
  RAW_INVOICE_BUCKET,
  RAW_INVOICE_TEXTRACT_BUCKET,
  STORAGE_BUCKET,
} from "../../src/handlers/int-test-support/test-constants";

describe("\n Invoice data buckets exists in S3\n", () => {
  test("Raw invoice bucket should exists in S3", async () => {
    const response = await listS3Objects({
      bucketName: RAW_INVOICE_BUCKET,
    });
    expect(response).toBeTruthy();
  });

  test("Raw invoice textract data bucket should exists in S3", async () => {
    const response = await listS3Objects({
      bucketName: RAW_INVOICE_TEXTRACT_BUCKET,
    });
    expect(response).toBeTruthy();
  });

  test("Storage bucket should exists in S3", async () => {
    const response = await listS3Objects({ bucketName: STORAGE_BUCKET });
    expect(response).toBeTruthy();
  });
});
