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

async function getCloudWatchLatestLogStreams() {
  const params = {
    logGroupName: process.env["LATEST_LOG_GROUP_NAME"],
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

async function getCloudWatchLatestLogStreamName() {
  const logStream: LogStream[] = await getCloudWatchLatestLogStreams();
  if (logStream.length > 0) {
    const result = logStream[0].logStreamName as string;
    return result;
  }
}

async function getFilteredEventFromLatestLogStream() {
  const latestLogStreamName = await getCloudWatchLatestLogStreamName();
  console.log("Latest Log StreamName:", latestLogStreamName);
  const params: FilterLogEventsCommandInput = {
    logGroupName: process.env["LATEST_LOG_GROUP_NAME"],
    logStreamNamePrefix: latestLogStreamName,
    filterPattern: "INFO sending record",
    startTime: eventId,
  };
  console.log("Filtered parameters:", params);
  const response: FilterLogEventsCommandOutput =
    await cloudWatchLogsClient.send(new FilterLogEventsCommand(params));
  console.log("FilteredCloudWatchLog:", response);
  const events: FilteredLogEvent[] = response.events ?? [];
  if (events.length > 0) {
    return events;
  }
  console.error("Filetered events empty", events);
}

export { getFilteredEventFromLatestLogStream };