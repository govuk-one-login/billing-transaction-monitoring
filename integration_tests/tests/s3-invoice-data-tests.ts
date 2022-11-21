import { getS3ItemsList } from "../helpers/s3Helper";

describe("\n Invoice data buckets exists in S3\n", () => {
  test("Raw pdf bucket should exists in S3", async () => {
    const response = await getS3ItemsList(`${process.env.ENV_PREFIX}-raw-invoice-pdf`);
    expect(response).toBeTruthy();
  });

  test("Raw invoice textract data bucket should exists in S3", async () => {
    const bucketNameMatchString = "di-btm-rawinvoicetextractdatabu";
    const response = await getS3ItemsList(`${process.env.ENV_PREFIX}-raw-invoice-textract-data`);
    expect(response).toBeTruthy();
  });

  test("Validated invoice data bucket should exists in S3", async () => {
    const bucketNameMatchString = "di-btm-validatedinvoicedatabuck";
    const response = await getS3ItemsList(`${process.env.ENV_PREFIX}-validated-invoice-data`);
    expect(response).toBeTruthy();
  });
});
