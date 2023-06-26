import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../clients";
import { IntTestHelpers } from "../handler";
import { runViaLambda } from "./envHelper";
import { sendLambdaCommand } from "./lambdaHelper";

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
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.sendEmail,
      params
    )) as unknown as string;
  try {
    const response = await sesClient.send(new SendEmailCommand(params));
    console.log(response);
    if (response.MessageId === undefined) {
      throw new Error("Error in sending the mail");
    }
    return response.MessageId;
  } catch (error) {
    throw new Error(`Failed to send mail: ${error}`);
  }
};
