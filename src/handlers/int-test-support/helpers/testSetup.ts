import { poll } from "./commonHelpers";
import {
  deleteS3Objects,
  deleteS3ObjectsByPrefix,
  listS3Objects,
} from "./s3Helper";
import {
  S3_TRANSACTION_FOLDER,
  STORAGE_BUCKET,
  S3_INVOICE_FOLDER,
  S3_INVOICE_ARCHIVED_FOLDER,
  RAW_INVOICE_BUCKET,
  RAW_INVOICE_TEXTRACT_BUCKET,
} from "../test-constants";

export default async function globalSetup(): Promise<void> {
  console.log("Cleaning up the environment before test execution starts");
  await deleteS3ObjectsAndPoll(STORAGE_BUCKET, `${S3_TRANSACTION_FOLDER}/2005`);
  await deleteS3ObjectsAndPoll(STORAGE_BUCKET, S3_INVOICE_FOLDER);
  await deleteS3ObjectsAndPoll(STORAGE_BUCKET, S3_INVOICE_ARCHIVED_FOLDER);
  await deleteAllObjects(RAW_INVOICE_BUCKET);
  await deleteAllObjects(RAW_INVOICE_TEXTRACT_BUCKET);
  console.log("All previous test data has been cleaned.");
}

const deleteS3ObjectsAndPoll = async (
  bucketName: string,
  prefix: string
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
      timeout: 60000,
      interval: 10000,
      notCompleteErrorMessage: `${prefix} folder could not be deleted because it still contains objects`,
    }
  );
};

const deleteAllObjects = async (bucketName: string): Promise<void> => {
  // List all  objects in the given bucket
  const s3Objects = await listS3Objects({ bucketName });

  if (s3Objects.length === 0) {
    console.log("The bucket is empty. Nothing to delete");
    return;
  }

  const keys = s3Objects
    .map((s3Object) => s3Object.key)
    .filter((key) => key !== undefined) as string[];

  await deleteS3Objects({ bucket: bucketName, keys });

  // poll to ensure that the bucket is empty
  await poll(
    async () =>
      await listS3Objects({
        bucketName,
      }),
    (s3Objects) => s3Objects.length === 0,
    {
      timeout: 60000,
      interval: 10000,
      notCompleteErrorMessage: `Objects could not be deleted because they still exist in the bucket`,
    }
  );
};
