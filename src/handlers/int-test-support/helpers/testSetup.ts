import { poll } from "./commonHelpers";
import { resourcePrefix } from "./envHelper";
import { deleteS3ObjectsByPrefix, listS3Objects } from "./s3Helper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;
const emailBucket = `${prefix}-email`;
const rawInvoiceBucket = `${prefix}-raw-invoice`;
const rawInvoiceTextractBucket = `${prefix}-raw-invoice-textract-data`;

export default async function globalSetup(): Promise<void> {
  console.log("Cleaning up the environment before test execution starts");
  await Promise.all([
    deleteS3ObjectsAndPoll(storageBucket, "btm_event_data/2005"),
    deleteS3ObjectsAndPoll(storageBucket, "btm_invoice_data"),
    deleteS3ObjectsAndPoll(storageBucket, "btm_extract_data"),
    deleteS3ObjectsAndPoll(emailBucket),
    deleteS3ObjectsAndPoll(rawInvoiceBucket),
    deleteS3ObjectsAndPoll(rawInvoiceTextractBucket),
  ]);
  console.log("All previous test data has been cleaned.");
}

export const deleteS3ObjectsAndPoll = async (
  bucketName: string,
  prefix: string = ""
): Promise<void> => {
  await deleteS3ObjectsByPrefix({ bucket: bucketName, prefixes: [prefix] });

  // poll to ensure that the objects with prefix have been deleted
  await poll(
    async () =>
      await listS3Objects({
        bucketName,
        prefix,
      }),
    (s3Objects) => s3Objects.length === 0,
    {
      timeout: 80000,
      interval: 10000,
      notCompleteErrorMessage: `${prefix} folder could not be deleted because it still contains objects`,
    }
  );
};
