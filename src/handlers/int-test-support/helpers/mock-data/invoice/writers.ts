import { writeFile } from "fs";
import { join } from "path";
import { putS3Object, S3Object } from "../../s3Helper";
import { WriteFunc } from "./invoice";
import { RAW_INVOICE_BUCKET } from "../../../test-constants";

export const writeInvoiceToS3 = async (
  file: string,
  directory: string,
  filename: string
): Promise<S3Object> => {
  const s3Object = {
    bucket: RAW_INVOICE_BUCKET,
    key: `${directory}/${filename}`,
  };

  console.log("S3Object Details:", s3Object);
  await putS3Object({ data: file, target: s3Object });
  return s3Object;
};

// This is just for testing the invoice creation during dev
// eslint-disable-next-line @typescript-eslint/promise-function-async
export const writeInvoiceToDisk: WriteFunc<void> = (
  file: string,
  directory: string,
  filename: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    writeFile(join(directory, filename), file, (err) => {
      if (err !== null) return reject(err);
      resolve();
    });
  });
