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
  const payload = JSON.stringify({
    environment: envName(),
    config: configName(),
    command,
    parameters,
  });

  // logger.info(toUtf8(commandInput.Payload as Uint8Array));
  const result = await invokeLambda(
    `${resourcePrefix()}-int-test-support-function`,
    payload
  );
  // logger.info(toUtf8(result.Payload as Uint8Array));

  if (result.StatusCode === 200 && result.Payload != null) {
    return JSON.parse(toUtf8(result.Payload)).successObject;
  } else {
    return "Error";
  }
};

export const invokeLambda = async (
  functionName: string,
  payload: string
): Promise<InvocationResponse> => {
  const command: InvokeCommandInput = {
    FunctionName: functionName,
    InvocationType: "RequestResponse",
    LogType: "Tail",
    Payload: fromUtf8(payload),
  };
  try {
    const response = await lambdaClient.send(new InvokeCommand(command));
    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
