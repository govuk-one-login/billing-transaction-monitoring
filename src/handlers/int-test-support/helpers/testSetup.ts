import { poll } from "./commonHelpers";
import { resourcePrefix } from "./envHelper";
import { deleteS3ObjectsByPrefix, listS3Objects } from "./s3Helper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export default async function globalSetup(): Promise<void> {
  // Delete objects with prefix "btm_event_data/2005"
  await deleteS3ObjectsByPrefix({
    bucket: storageBucket,
    prefixes: ["btm_event_data/2005"],
  });
  // poll to ensure that the objects with prefix "btm_event_data/2005" have been deleted
  await poll(
    async () =>
      await listS3Objects({
        bucketName: storageBucket,
        prefix: "btm_event_data/2005",
      }),
    (s3Objects) => s3Objects.Contents?.length === 0,
    {
      timeout: 60000,
      interval: 10000,
      notCompleteErrorMessage:
        "btm_event_data/2005 folder could not be deleted because it still contains objects",
    }
  );

  // Delete objects with prefix "btm_invoice_data"
  await deleteS3ObjectsByPrefix({
    bucket: storageBucket,
    prefixes: ["btm_invoice_data"],
  });

  // poll to ensure that the objects with prefix "btm_invoice_data" have been deleted
  await poll(
    async () =>
      await listS3Objects({
        bucketName: storageBucket,
        prefix: "btm_invoice_data",
      }),
    (s3Objects) => s3Objects.Contents?.length === 0,
    {
      timeout: 60000,
      interval: 10000,
      notCompleteErrorMessage:
        "invoice_data folder could not be deleted because it still contains objects",
    }
  );
}
