import {
  DescribeLogStreamsCommand,
  DescribeLogStreamsCommandOutput,
  LogStream,
  FilterLogEventsCommandInput,
  FilterLogEventsCommandOutput,
  FilteredLogEvent,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

import { cloudWatchLogsClient } from "../clients/cloudWatchLogsClient";

import { eventId } from "../helpers/snsHelper";

import delay from "delay";

async function getCloudWatchLatestLogStreams(log_groupName: string) {
  const params = {
    logGroupName: log_groupName,
    orderBy: "LastEventTime",
    descending: true,
    limit: 1,
  };
  await delay(10000); //time delay
  console.log("WAITED 10s FOR THE LOG TO POPULATE IN CLOUDWATCH");
  const response: DescribeLogStreamsCommandOutput =
    await cloudWatchLogsClient.send(new DescribeLogStreamsCommand(params));
  const latestLogStearmResponse: LogStream[] = response.logStreams ?? [];
  return latestLogStearmResponse;
}

async function getCloudWatchLatestLogStreamName(log_groupName: string) {
  const logStream: LogStream[] = await getCloudWatchLatestLogStreams(log_groupName);
  if (logStream.length > 0) {
    const result = logStream[0].logStreamName as string;
    return result;
  } else {
    throw Error("No log streams found");
  }
}

async function getFilteredEventFromLatestLogStream(log_groupName: string) {
  const latestLogStreamName = await getCloudWatchLatestLogStreamName(log_groupName);
  console.log("Latest Log StreamName:", latestLogStreamName);
  const params: FilterLogEventsCommandInput = {
    logGroupName: log_groupName,
    logStreamNamePrefix: latestLogStreamName,
    startTime: eventId,
  };
  console.log("Filtered parameters:", params);
  const response: FilterLogEventsCommandOutput =
    await cloudWatchLogsClient.send(new FilterLogEventsCommand(params));
  console.log("FilteredCloudWatchLog:", response);
  const events: FilteredLogEvent[] = response.events ?? [];
  if (events.length > 0) {
    return events;
  } else {
    throw Error("Filtered events empty");
  }
}

export { getFilteredEventFromLatestLogStream };