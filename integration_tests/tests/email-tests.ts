import {
  EmailParams,
  sendEmail,
  verifyEmailAddress,
} from "../../src/handlers/int-test-support/helpers/sesHelper";

describe("\n Email sending test \n", () => {
  test("tests", async () => {
    const params: EmailParams = {
      Source: "test",
      Destination: {
        ToAddresses: ["test"],
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
    await verifyEmailAddress(params.Source);
    await sendEmail(params);
  });
});
