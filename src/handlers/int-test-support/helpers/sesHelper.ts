import nodemailer from "nodemailer";
import { IntTestHelpers } from "../handler";
import { runViaLambda } from "./envHelper";
import { sendLambdaCommand } from "./lambdaHelper";
import { getSecret } from "./secretsManagerHelper";

export type EmailParams = {
  Source: string;
  Destination: {
    ToAddresses: string[];
  };
  Message: {
    Subject: {
      Data: string;
    };
    Body: {
      Text: {
        Data: string;
      };
    };
    Attachment?: {
      Filename: string;
      Content: string;
      ContentType: string;
    };
  };
};

export const sendEmail = async (params: EmailParams): Promise<string> => {
  console.log("sendEmail");
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.sendEmail,
      params
    )) as unknown as string;

  try {
    if (!process.env.EMAIL_SENDER_NAME_ID)
      throw Error("No `EMAIL_SENDER_NAME_ID` given");

    if (!process.env.EMAIL_SENDER_PASSWORD_ID)
      throw Error("No `EMAIL_SENDER_PASSWORD_ID` given");

    const [user, pass] = await Promise.all([
      getSecret({ id: process.env.EMAIL_SENDER_NAME_ID }),
      getSecret({ id: process.env.EMAIL_SENDER_PASSWORD_ID }),
    ]);

    const transporter = nodemailer.createTransport({
      host: "email-smtp.eu-west-2.amazonaws.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    const { messageId } = await transporter.sendMail({
      from: params.Source,
      to: params.Destination.ToAddresses.join(", "),
      subject: params.Message.Subject.Data,
      text: params.Message.Body.Text.Data,
      attachments: params.Message.Attachment
        ? [
            {
              filename: params.Message.Attachment.Filename,
              content: params.Message.Attachment.Content,
              contentType: params.Message.Attachment.ContentType,
            },
          ]
        : [],
    });

    return messageId;
  } catch (error) {
    throw new Error(`Failed to send mail: ${error}`);
  }
};
