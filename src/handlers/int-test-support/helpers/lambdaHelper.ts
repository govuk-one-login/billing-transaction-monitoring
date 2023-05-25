import { InvokeCommand, InvokeCommandInput } from "@aws-sdk/client-lambda";
import { fromUtf8, toUtf8 } from "@aws-sdk/util-utf8-node";
import { lambdaClient } from "../clients";
import { HelperDict, IntTestHelpers } from "../handler";
import { configName, envName, resourcePrefix, runViaLambda } from "./envHelper";

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
  const result = await invokeLambda({
    functionName: `${resourcePrefix()}-int-test-support-function`,
    payload,
    forceWithoutLambda: true,
  });
  // logger.info(toUtf8(result.Payload as Uint8Array));

  if (result.statusCode === 200 && result.payload != null) {
    return JSON.parse(toUtf8(result.payload)).successObject;
  } else {
    return "Error";
  }
};

export interface InvokeLambdaParams {
  functionName: string;
  payload: string;
  forceWithoutLambda?: boolean;
}

interface InvokeLambdaResponse {
  statusCode: number | undefined;
  payload?: Uint8Array;
}

export const invokeLambda = async (
  params: InvokeLambdaParams
): Promise<InvokeLambdaResponse> => {
  if (runViaLambda() && !params.forceWithoutLambda) {
    return (await sendLambdaCommand(
      IntTestHelpers.invokeLambda,
      params
    )) as unknown as InvokeLambdaResponse;
  }
  const command: InvokeCommandInput = {
    FunctionName: params.functionName,
    InvocationType: "RequestResponse",
    LogType: "Tail",
    Payload: fromUtf8(params.payload),
  };
  try {
    const response = await lambdaClient.send(new InvokeCommand(command));

    if (response === undefined) {
      throw new Error("InvokeCommand returned undefined");
    }
    return {
      statusCode: response.StatusCode,
      payload: response.Payload,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};