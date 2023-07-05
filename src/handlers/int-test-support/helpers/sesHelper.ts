import { SendEmailCommand, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../clients";
import { IntTestHelpers, SerializableData } from "../handler";
import { runViaLambda } from "./envHelper";
import { sendLambdaCommand } from "./lambdaHelper";

export type RawMessage = {
  Data: Uint8Array;
};

export type RawEmailParams = {
  Source: string;
  Destination: {
    ToAddresses: string[];
  };
  RawMessage: RawMessage;
};

export const sendRawEmail = async (params: RawEmailParams): Promise<string> => {
  if (runViaLambda()) {
    const serialisedParams = {
      ...params,
      RawMessage: {
        Data: params.RawMessage.Data,
      },
    } as unknown as RawEmailParams & SerializableData;
    return await sendLambdaCommand(
      IntTestHelpers.sendRawEmail,
      serialisedParams
    );
  }

  try {
    const response = await sesClient.send(new SendRawEmailCommand(params));
    if (response.MessageId === undefined) {
      throw new Error("Error in sending the mail");
    }
    return response.MessageId;
  } catch (error) {
    throw new Error(`Failed to send mail: ${error}`);
  }
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
