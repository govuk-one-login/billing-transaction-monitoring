import { resourcePrefix } from "./envHelper";
import { deleteS3Objects } from "./s3Helper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export default async function globalSetup(): Promise<void> {
  await deleteS3Objects({
    bucketName: storageBucket,
  });
  console.log("Deleted storage bucket before running the tests");
}
