import {
  FilterLogEventsCommandInput,
  FilterLogEventsCommandOutput,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

import { runViaLambda } from "./envHelper";
import { cloudWatchLogsClient } from "../clients";
import { sendLambdaCommand } from "./lambdaHelper";
import { IntTestHelpers } from "../handler";

interface LogCheckParameters {
  logName: string;
  expectedString: string;
  testStartTime: number;
}
interface LogEvent {
  eventId?: string;
  message?: string;
  logStreamName?: string;
}

export async function getRecentCloudwatchLogs(params: {
  logName: string;
}): Promise<LogEvent[]> {
  if (runViaLambda()) {
    return (await sendLambdaCommand(
      IntTestHelpers.getRecentCloudwatchLogs,
      params
    )) as unknown as LogEvent[];
  }

  const commandInput: FilterLogEventsCommandInput = {
    logGroupName: "/aws/lambda/" + params.logName,
    startTime: Date.now() - 60 * 1000,
  };

  const response = await cloudWatchLogsClient.send(
    new FilterLogEventsCommand(commandInput)
  );
  return response.events ?? [];
}

export async function checkGivenStringExistsInLogs(
  params: LogCheckParameters
): Promise<boolean> {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.checkGivenStringExistsInLogs,
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
