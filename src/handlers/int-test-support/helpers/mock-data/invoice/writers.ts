import { writeFile } from "fs";
import { join } from "path";
import { resourcePrefix } from "../../envHelper";
import { putS3Object, S3Object } from "../../s3Helper";
import { WriteFunc } from "./invoice";

export const writeInvoiceToS3 = async (
  file: ArrayBuffer,
  directory: string,
  filename: string
): Promise<S3Object> => {
  const s3Object = {
    bucket: `${resourcePrefix()}-raw-invoice-pdf`,
    key: `${directory}/${filename}`,
  };
  await putS3Object({ data: file, target: s3Object });
  return s3Object;
};

// This is just for testing the invoice creation during dev
// eslint-disable-next-line @typescript-eslint/promise-function-async
export const writeInvoiceToDisk: WriteFunc<void> = (
  file: ArrayBuffer,
  directory: string,
  filename: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    writeFile(join(directory, filename), new DataView(file), (err) => {
      if (err !== null) return reject(err);
      resolve();
    });
  });
