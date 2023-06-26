import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { VendorId } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import {
  EmailParams,
  sendEmail,
} from "../../src/handlers/int-test-support/helpers/sesHelper";
import {
  checkS3BucketForGivenStringExists,
  BucketAndPrefix,
} from "../../src/handlers/int-test-support/helpers/s3Helper";

const vendorEmailMap: Record<string, VendorId> = {
  vendor1: VendorId.vendor_testvendor1,
  vendor2: VendorId.vendor_testvendor2,
  vendor3: VendorId.vendor_testvendor3,
};

describe("\n Email storage \n", () => {
  test.each`
    vendor
    ${"vendor1"}
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
      const testTime = new Date("2023-06-25T21:00:00.000Z");
      console.log(testTime);
      const messageId = await sendEmail(params);
      const id = `Message-ID: <${messageId}`;

      const s3Params: BucketAndPrefix = {
        bucketName: emailBucket,
      };
      console.log(messageId);
      const test = await checkS3BucketForGivenStringExists(
        id,
        80000,
        s3Params,
        testTime
      );
      console.log(test);
      expect(test).toBe(true);
    }
  );
});
