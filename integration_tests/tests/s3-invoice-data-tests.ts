import { getS3ItemsList } from "../helpers/s3Helper";
import {resourcePrefix} from "../helpers/envHelper";

const prefix = resourcePrefix();

describe("\n Invoice data buckets exists in S3\n", () => {
  test("Raw pdf bucket should exists in S3", async () => {
    const response = await getS3ItemsList(`${prefix}-raw-invoice-pdf`);
    expect(response).toBeTruthy();
  });

  test("Raw invoice textract data bucket should exists in S3", async () => {
    const response = await getS3ItemsList(`${prefix}-raw-invoice-textract-data`);
    expect(response).toBeTruthy();
  });

  test("Storage bucket should exists in S3", async () => {
    const response = await getS3ItemsList(`${prefix}-storage`);
    expect(response).toBeTruthy();
  });
});
