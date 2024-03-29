import { InvokeCommand, InvokeCommandInput } from "@aws-sdk/client-lambda";
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

export const invokeSyntheticLambda =
  async (): Promise<InvokeLambdaResponse> => {
    const params: InvokeLambdaParams = {
      functionName: `${resourcePrefix()}-synthetic-event-generation`,
      payload: "",
    };
    return await invokeLambda(params);
  };
