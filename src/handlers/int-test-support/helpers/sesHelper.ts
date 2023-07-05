import { SendEmailCommand, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../clients";
import { IntTestHelpers } from "../handler";
import { runViaLambda } from "./envHelper";
import { sendLambdaCommand } from "./lambdaHelper";

export type AttachmentOption = {
  data: Buffer | string;
  name: string;
};

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
  };
};

export const sendEmail = async (params: EmailParams): Promise<string> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.sendEmail,
      params
    )) as unknown as string;
  try {
    const response = await sesClient.send(new SendEmailCommand(params));
    if (response.MessageId === undefined) {
      throw new Error("Error in sending the mail");
    }
    return response.MessageId;
  } catch (error) {
    throw new Error(`Failed to send mail: ${error}`);
  }
};

export type rawEmailParams = {
  Source: string;
  Destination: {
    ToAddresses: string[];
  };
  RawMessage: {
    Data: Uint8Array;
  };
};

export const sendRawEmail = async (params: rawEmailParams): Promise<string> => {
  console.log(params);
  try {
    const response = await sesClient.send(new SendRawEmailCommand(params));
    console.log(response);
    if (response.MessageId === undefined) {
      throw new Error("Error in sending the mail");
    }
    return response.MessageId;
  } catch (error) {
    throw new Error(`Failed to send mail: ${error}`);
  }
};
