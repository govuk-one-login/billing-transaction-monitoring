import { InvokeCommand, InvokeCommandInput } from "@aws-sdk/client-lambda";
import { fromUtf8, toUtf8 } from "@aws-sdk/util-utf8-node";
import { lambdaClient } from "../clients";
import { envName, resourcePrefix } from "./envHelper";

export const sendLambdaCommand = async (
  command: string,
  parameters: any
): Promise<string> => {
  const commandInput: InvokeCommandInput = {
    FunctionName: `${resourcePrefix()}-int-test-support-function`,
    InvocationType: "RequestResponse",
    LogType: "Tail",
    Payload: fromUtf8(
      JSON.stringify({ environment: envName(), command, parameters })
    ),
  };

  console.log(toUtf8(commandInput.Payload as Uint8Array));

  const result = await lambdaClient.send(new InvokeCommand(commandInput));

  if (result.StatusCode === 200 && result.Payload != null) {
    console.log(toUtf8(result.Payload));
    return JSON.parse(toUtf8(result.Payload)).successObject;
  } else {
    return "Error";
  }
};
