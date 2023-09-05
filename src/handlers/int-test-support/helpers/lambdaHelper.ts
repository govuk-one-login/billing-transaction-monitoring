import {
  GetFunctionConfigurationCommand,
  InvokeCommand,
  InvokeCommandInput,
  UpdateFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import { fromUtf8, toUtf8 } from "@aws-sdk/util-utf8-node";
import { lambdaClient } from "../clients";
import type { HelperDict } from "../handler";
import { IntTestHelpers, SerializableData } from "../types";
import { poll } from "./commonHelpers";
import { configName, envName, resourcePrefix, runViaLambda } from "./envHelper";

export const sendLambdaCommand = async <THelper extends IntTestHelpers>(
  command: THelper,
  parameters: Parameters<HelperDict[THelper]>[0] & SerializableData
): Promise<string> => {
  const payload = JSON.stringify({
    environment: envName(),
    config: configName(),
    command,
    parameters,
  });
  // logger.info(`${payload}`);
  const result = await invokeLambda({
    functionName: `${resourcePrefix()}-int-test-support-function`,
    payload,
    forceWithoutLambda: true,
  });
  // logger.info(toUtf8(result.payload as Uint8Array));

  if (result.statusCode === 200 && result.payload != null) {
    return JSON.parse(toUtf8(result.payload)).successObject;
  } else {
    return "Error";
  }
};

type InvokeLambdaParams = {
  functionName: string;
  payload: string;
  forceWithoutLambda?: boolean;
};

type InvokeLambdaResponse = {
  statusCode: number | undefined;
  payload?: Uint8Array;
};

const invokeLambda = async (
  params: InvokeLambdaParams
): Promise<InvokeLambdaResponse> => {
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

export const restartLambda = async (functionName: string): Promise<void> => {
  if (runViaLambda()) {
    await sendLambdaCommand(IntTestHelpers.restartLambda, functionName);
    return;
  }
  try {
    const { Environment } = await lambdaClient.send(
      new GetFunctionConfigurationCommand({ FunctionName: functionName })
    );
    const currentEnv = Environment?.Variables ?? {};
    const params = {
      FunctionName: functionName,
      Environment: {
        Variables: currentEnv,
      },
    };
    await lambdaClient.send(new UpdateFunctionConfigurationCommand(params));
    await checkLambdaStatus(functionName, 80000);
  } catch (error) {
    console.error(`Error initiating function ${functionName}:`, error);
    throw error;
  }
};

const checkLambdaStatus = async (
  functionName: string,
  timeoutMs: number
): Promise<boolean> => {
  const pollLambdaStatus = async (): Promise<boolean> => {
    const response = await lambdaClient.send(
      new GetFunctionConfigurationCommand({ FunctionName: functionName })
    );
    return response.LastUpdateStatus === "Successful";
  };
  return await poll(pollLambdaStatus, (result) => result, {
    timeout: timeoutMs,
    interval: 5000,
    notCompleteErrorMessage: `Error getting status for function: ${functionName}`,
  });
};
