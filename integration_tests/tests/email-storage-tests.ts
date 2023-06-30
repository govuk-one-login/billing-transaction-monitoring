import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  EmailParams,
  sendEmail,
} from "../../src/handlers/int-test-support/helpers/sesHelper";
import {
  checkS3BucketForGivenStringExists,
  BucketAndPrefix,
} from "../../src/handlers/int-test-support/helpers/s3Helper";

describe.skip("\n Email storage \n", () => {
  test("should store the received email in the corresponding directory in the email bucket", async () => {
    const prefix = resourcePrefix();
    const extractedEnvValue = prefix.split("-").pop();
    const emailBucket = `${prefix}-email`;
    const sourceEmail = `no-reply@btm.${extractedEnvValue}.account.gov.uk`;
    const toEmail = `vendor1_invoices@btm.${extractedEnvValue}.account.gov.uk`;
    const directory = "vendor_testvendor1";
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
    const testTime = new Date();
    const messageId = await sendEmail(params);
    const stringToCheckInEmailContents = `Message-ID: <${messageId}`;
    const s3Params: BucketAndPrefix = {
      bucketName: emailBucket,
      prefix: `${directory}`,
    };
    const givenStringExists = await checkS3BucketForGivenStringExists(
      stringToCheckInEmailContents,
      30000,
      s3Params,
      testTime
    );
    expect(givenStringExists).toBe(true);
  });
});
