import {
  InvocationResponse,
  InvokeCommand,
  InvokeCommandInput,
} from "@aws-sdk/client-lambda";
import { fromUtf8, toUtf8 } from "@aws-sdk/util-utf8-node";
import { lambdaClient } from "../clients";
import { HelperDict, IntTestHelpers } from "../handler";
import { configName, envName, resourcePrefix } from "./envHelper";

export const sendLambdaCommand = async <THelper extends IntTestHelpers>(
  command: THelper,
  parameters: Parameters<HelperDict[THelper]>[0]
): Promise<string> => {
  const commandInput: InvokeCommandInput = {
    FunctionName: `${resourcePrefix()}-int-test-support-function`,
    InvocationType: "RequestResponse",
    LogType: "Tail",
    Payload: fromUtf8(
      JSON.stringify({
        environment: envName(),
        config: configName(),
        command,
        parameters,
      })
    ),
  };

  // console.log(toUtf8(commandInput.Payload as Uint8Array));
  const result = await lambdaClient.send(new InvokeCommand(commandInput));
  // console.log(toUtf8(result.Payload as Uint8Array));

  if (result.StatusCode === 200 && result.Payload != null) {
    return JSON.parse(toUtf8(result.Payload)).successObject;
  } else {
    return "Error";
  }
};

export const invokeLambda = async (
  parameters: object
): Promise<InvocationResponse> => {
  const params = {
    FunctionName: "di-btm-nk-446-test-filter-function",

    Payload: fromUtf8(
      JSON.stringify({
        parameters,
      })
    ),
  };

  const command: InvokeCommandInput = params;
  try {
    const response = await lambdaClient.send(new InvokeCommand(command));
    console.log(response);
    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
