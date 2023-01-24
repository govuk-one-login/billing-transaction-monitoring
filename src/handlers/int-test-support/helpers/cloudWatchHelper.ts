import {
  FilterLogEventsCommandInput,
  FilterLogEventsCommandOutput,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

import { runViaLambda } from "./envHelper";
import { cloudWatchLogsClient } from "../clients";
import { sendLambdaCommand } from "./lambdaHelper";

interface LogCheckParameters {
  logName: string;
  expectedString: string;
  testStartTime: number;
}

async function checkGivenStringExistsInLogs(
  params: LogCheckParameters
): Promise<boolean> {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "checkGivenStringExistsInLogs",
      params
    )) as unknown as boolean;
  const commandInput: FilterLogEventsCommandInput = {
    logGroupName: "/aws/lambda/" + params.logName,
    startTime: params.testStartTime,
  };

  const response: FilterLogEventsCommandOutput =
    await cloudWatchLogsClient.send(new FilterLogEventsCommand(commandInput));

  return response.events != null
    ? response.events?.some((x) => x.message?.includes(params.expectedString))
    : false;
}

export { checkGivenStringExistsInLogs };
