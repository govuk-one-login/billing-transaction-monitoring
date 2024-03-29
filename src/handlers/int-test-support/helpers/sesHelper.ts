import nodemailer from "nodemailer";
import { IntTestHelpers } from "../types";
import { runViaLambda } from "./envHelper";
import { sendLambdaCommand } from "./lambdaHelper";
import { getSecret } from "./secretsManagerHelper";
import { AWS_REGION } from "../../../shared/constants";

export type EmailParams = {
  SourceAddress: string;
  DestinationAddresses: string[];
  Subject: string;
  MessageBody: string;
  Attachments?: string[];
};

export const sendEmail = async (params: EmailParams): Promise<string> => {
  if (runViaLambda()) {
    return (await sendLambdaCommand(
      IntTestHelpers.sendEmail,
      params
    )) as unknown as string;
  }
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
      host: `email-smtp.${AWS_REGION}.amazonaws.com`,
      port: 465,
      secure: true,
      auth: { user, pass },
    });
    const { messageId } = await transporter.sendMail({
      from: params.SourceAddress,
      to: params.DestinationAddresses.join(", "),
      subject: params.Subject,
      text: params.MessageBody,
      attachments: params.Attachments
        ? params.Attachments.map((attachment) => ({
            raw: attachment,
          }))
        : [],
    });

    return messageId;
  } catch (error) {
    throw new Error(`Failed to send mail: ${error}`);
  }
};
