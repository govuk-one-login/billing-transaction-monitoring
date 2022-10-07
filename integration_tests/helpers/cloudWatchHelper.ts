import {
  DescribeLogStreamsCommand,
  DescribeLogStreamsCommandOutput,
  LogStream,
  FilterLogEventsCommandInput,
  FilterLogEventsCommandOutput,
  FilteredLogEvent,
  FilterLogEventsCommand,
  GetLogGroupFieldsCommandOutput,
  GetLogGroupFieldsCommand,
  DescribeLogGroupsCommandOutput,
  DescribeLogGroupsCommand,
  LogGroup,
} from "@aws-sdk/client-cloudwatch-logs";

import { cloudWatchLogsClient } from "../clients/cloudWatchLogsClient";

import { eventId } from "../helpers/snsHelper";

import delay from "delay";

async function getLogGroupsList() {
  const params = {};
  const response: DescribeLogGroupsCommandOutput =
    await cloudWatchLogsClient.send(new DescribeLogGroupsCommand(params));
  const logGroups: LogGroup[] = response.logGroups ?? [];
  return logGroups;
}

async function getLogGroupName(logName: string) {
  const groupNameList = await getLogGroupsList();
  const groupName: LogGroup = groupNameList.find((data) =>
    data.logGroupName?.match(logName)
  ) as LogGroup;
  const name = groupName.logGroupName?.valueOf();
  console.log("**Log GroupName**",name)
  return name;
}

async function getCloudWatchLatestLogStreams(logName: string) {
  const params = {
    logGroupName: await getLogGroupName(logName),
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

async function getCloudWatchLatestLogStreamName(logName: string) {
  const logStream: LogStream[] = await getCloudWatchLatestLogStreams(logName);
  if (logStream.length > 0) {
    const result = logStream[0].logStreamName as string;
    return result;
  } else {
    throw Error("No log streams found");
  }
}

async function getFilteredEventFromLatestLogStream(logName: string) {
  const latestLogStreamName = await getCloudWatchLatestLogStreamName(logName);
  console.log("Latest Log StreamName:", latestLogStreamName);
  const params: FilterLogEventsCommandInput = {
    logGroupName: await getLogGroupName(logName),
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

export { getFilteredEventFromLatestLogStream, getLogGroupName };
