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
    console.log(`Successfully restarted ${functionName}`);
  } catch (error) {
    console.error(`Error restarting function ${functionName}:`, error);
    throw error;
  }
};

export const invokeSyntheticLambda = async (
  payload: string
): Promise<InvokeLambdaResponse> => {
  const params: InvokeLambdaParams = {
    functionName: `${resourcePrefix()}-synthetic-event-generation`,
    payload,
  };
  return await invokeLambda(params);
};
