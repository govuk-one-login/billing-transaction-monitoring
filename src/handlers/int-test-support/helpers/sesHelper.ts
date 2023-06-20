import {
  SendEmailCommand,
  VerifyEmailAddressCommand,
} from "@aws-sdk/client-ses";
import { sesClient } from "../clients";

export interface EmailParams {
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
    Attachment?: Attachment[];
  };
}

export interface Attachment {
  Filename: string;
  Content: string;
  ContentType: string;
}

export const sendEmail = async (params: EmailParams): Promise<void> => {
  try {
    await sesClient.send(new SendEmailCommand(params));
  } catch (error) {
    throw new Error(`Failed to send mail: ${error}`);
  }
};

export const verifyEmailAddress = async (
  emailAddress: string
): Promise<void> => {
  const params = {
    EmailAddress: emailAddress,
  };
  try {
    await sesClient.send(new VerifyEmailAddressCommand(params));
  } catch (error) {
    throw new Error(
      `Failed to do email address verification for ${emailAddress}: ${error}`
    );
  }
};
