import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  listS3Objects,
  S3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { VendorId } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import {
  EmailParams,
  sendEmail,
} from "../../src/handlers/int-test-support/helpers/sesHelper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";

const vendorEmailMap: Record<string, VendorId> = {
  vendor1: VendorId.vendor_testvendor1,
  vendor2: VendorId.vendor_testvendor2,
  vendor3: VendorId.vendor_testvendor3,
};

describe("\n Email storage \n", () => {
  test.each`
    vendor
    ${"vendor1"}
    ${"vendor2"}
    ${"vendor3"}
  `(
    "should store the received email in the corresponding directory in the email bucket",
    async ({ vendor }) => {
      const prefix = resourcePrefix();
      const extractedValue = prefix.split("-").pop();
      console.log(extractedValue);
      const emailBucket = `${prefix}-email`;
      const sourceEmail = `no-reply@btm.${extractedValue}.account.gov.uk`;
      const toEmail = `${vendor}_invoices@btm.${extractedValue}.account.gov.uk`;
      const directory = vendorEmailMap[vendor];

      console.log(sourceEmail);
      console.log(toEmail);
      console.log(directory);

      const params: EmailParams = {
        Source: sourceEmail,
        Destination: {
          ToAddresses: [toEmail],
        },
        Message: {
          Subject: {
            Data: "test",
          },
          Body: {
            Text: {
              Data: "test",
            },
          },
        },
      };

      const messageId = await sendEmail(params);
      console.log(messageId);

      const s3Params: S3Object = {
        bucket: emailBucket,
        key: `${directory}/${messageId}`,
      };

      const result = await poll(
        async () =>
          await listS3Objects({
            bucketName: s3Params.bucket,
            prefix: `${directory}`,
          }),
        (Contents) => Contents.some((obj) => obj.key?.includes(messageId)),
        {
          interval: 10000,
          notCompleteErrorMessage: `${s3Params.key} not found`,
          timeout: 30000,
        }
      );
      console.log(result);
    }
  );
});
