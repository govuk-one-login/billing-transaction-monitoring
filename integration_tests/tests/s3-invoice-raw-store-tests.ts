import path from "path";
import fs from "fs";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  checkIfS3ObjectExists,
  deleteS3Objects,
  listS3Objects,
  putS3Object,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";

const prefix = resourcePrefix();
const givenVendorIdFolder = "vendor123";

describe("\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n", () => {
  const uniqueString = Math.random().toString(36).substring(2, 7);
  const rawInvoice: S3Object = {
    bucket: `${prefix}-raw-invoice`,
    key: `${givenVendorIdFolder}/raw-Invoice-${uniqueString}-invalidFile.pdf`,
  };

  test("should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ", async () => {
    const file = "../payloads/invalidFileToTestTextractFailure.pdf";
    const filename = path.join(__dirname, file);
    const fileData = fs.readFileSync(filename).toString();

    await putS3Object({ data: fileData, target: rawInvoice });

    const checkRawPdfFileExists = await checkIfS3ObjectExists(rawInvoice);
    expect(checkRawPdfFileExists).toBeTruthy();

    const isFileMovedToFailedFolder = async (): Promise<boolean> => {
      const result = await listS3Objects({
        bucketName: rawInvoice.bucket,
        prefix: "failed",
      });
      return (
        !!result && result.some((items) => items.key?.includes(rawInvoice.key))
      );
    };

    const pollOptions = {
      timeout: 40000,
      notCompleteErrorMessage:
        "File was not moved to failed folder within the specified timeout",
    };

    const originalFileExistsInFailedFolder = await poll(
      isFileMovedToFailedFolder,
      (resolution) => resolution,
      pollOptions
    );
    expect(originalFileExistsInFailedFolder).toBeTruthy();
    await deleteS3Objects({
      bucket: rawInvoice.bucket,
      keys: ["failed/" + rawInvoice.key],
    });
  });
});
