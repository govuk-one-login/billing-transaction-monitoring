import crypto from "node:crypto";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  EmailParams,
  sendEmail,
} from "../../src/handlers/int-test-support/helpers/sesHelper";
import {
  checkS3BucketForGivenStringExists,
  BucketAndPrefix,
} from "../../src/handlers/int-test-support/helpers/s3Helper";

describe("\n Email storage \n", () => {
  test("should store the received email in the corresponding directory in the email bucket", async () => {
    const prefix = resourcePrefix();
    const extractedEnvValue = prefix.split("-").pop();
    const emailBucket = `${prefix}-email`;
    const sourceEmail = `no-reply@btm.${extractedEnvValue}.account.gov.uk`;
    const toEmail = `vendor1_invoices@btm.${extractedEnvValue}.account.gov.uk`;
    const directory = "vendor_testvendor1";
    const messageBody = crypto.randomBytes(32).toString("hex");
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
            Data: messageBody,
          },
        },
      },
    };
    const testTime = new Date();
    await sendEmail(params);
    const s3Params: BucketAndPrefix = {
      bucketName: emailBucket,
      prefix: `${directory}`,
    };
    const givenStringExists = await checkS3BucketForGivenStringExists(
      messageBody,
      30000,
      s3Params,
      testTime
    );
    expect(givenStringExists).toBe(true);
  });
});
