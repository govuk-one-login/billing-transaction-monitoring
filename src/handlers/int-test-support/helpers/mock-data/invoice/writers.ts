import { writeFile } from "fs";
import { resourcePrefix } from "../../envHelper";
import { putS3Object, S3Object } from "../../s3Helper";

export const writeInvoiceToS3 = async (
  file: ArrayBuffer
): Promise<S3Object> => {
  const s3Object = {
    bucket: `${resourcePrefix()}-raw-invoice-pdf`,
    key: `raw-Invoice-${Math.random()
      .toString(36)
      .substring(2, 7)}-validFile.pdf`,
  };
  await putS3Object({ data: file, target: s3Object });
  return s3Object;
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
