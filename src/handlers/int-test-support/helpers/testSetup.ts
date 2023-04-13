import { poll } from "./commonHelpers";
import { resourcePrefix } from "./envHelper";
import { deleteS3Objects, listS3Objects } from "./s3Helper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export default async function globalSetup(): Promise<void> {
  await deleteS3Objects({
    bucketName: storageBucket,
  });

  await poll(
    async () =>
      await listS3Objects({
        bucketName: storageBucket,
      }),
    (s3Objects) => s3Objects.Contents === undefined,
    {
      timeout: 60000,
      interval: 10000,
      nonCompleteErrorMessage: "Bucket is not empty after deleting objects",
    }
  );
  console.log("Deleted storage bucket before running the tests");
}
