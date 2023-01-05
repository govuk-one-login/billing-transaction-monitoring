import { writeFile } from "fs";
import { resourcePrefix } from "../../envHelper";
import { putObjectToS3 } from "../../s3Helper";

export const writeInvoiceToS3 = async (
  file: ArrayBuffer
): Promise<{ bucketName: string; path: string }> => {
  const bucketName = `${resourcePrefix()}-raw-invoice-pdf`;
  const path = `raw-Invoice-${Math.random()
    .toString(36)
    .substring(2, 7)}-validFile.pdf`;
  await putObjectToS3({bucket:bucketName, key:path}, file);
  return {
    bucketName,
    path,
  };
};

// This is just for testing the invoice creation during dev
// eslint-disable-next-line @typescript-eslint/promise-function-async
export const writeInvoiceToDisk = (file: ArrayBuffer): Promise<void> =>
  new Promise((resolve, reject) => {
    writeFile("./invoice.pdf", new DataView(file), (err) => {
      if (err !== null) return reject(err);
      resolve();
    });
  });
