import { resourcePrefix } from "./envHelper";
import { deleteS3Objects } from "./s3Helper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export default async function globalSetup(): Promise<void> {
  if (!prefix.includes("dev") || !prefix.includes("build"))
    await deleteS3Objects({
      bucketName: storageBucket,
    });
  console.log("Deleted storage bucket before running the tests ");
}
