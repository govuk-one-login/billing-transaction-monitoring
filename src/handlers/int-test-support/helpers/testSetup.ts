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
  await Promise.all([
    deleteS3ObjectsAndPoll(STORAGE_BUCKET, `${S3_TRANSACTION_FOLDER}/2005`),
    deleteS3ObjectsAndPoll(STORAGE_BUCKET, S3_INVOICE_FOLDER),
    deleteS3ObjectsAndPoll(STORAGE_BUCKET, S3_INVOICE_ARCHIVED_FOLDER),
    deleteAllObjects(RAW_INVOICE_BUCKET),
    deleteAllObjects(RAW_INVOICE_TEXTRACT_BUCKET),
  ]);
}

const deleteS3ObjectsAndPoll = async (
  bucketName: string,
  prefix: string
): Promise<void> => {
  await deleteS3ObjectsByPrefix({ bucket: bucketName, prefixes: [prefix] });

  // poll to ensure that the objects with prefix "btm_event_data/2005" have been deleted
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
  const s3Objects = await listS3Objects({ bucketName });
  console.log(s3Objects);
  if (s3Objects.length === 0) {
    console.log("The bucket is empty. No folders to delete");
    return;
  }
  for (const s3Object of s3Objects) {
    if (typeof s3Object.key === "string") {
      const key = s3Object.key;

      await deleteS3Objects({ bucket: bucketName, keys: [key] });
    }
  }
};
