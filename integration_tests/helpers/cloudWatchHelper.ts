import {
  FilterLogEventsCommandInput,
  FilterLogEventsCommandOutput,
  FilteredLogEvent,
  FilterLogEventsCommand,
  DescribeLogGroupsCommandOutput,
  DescribeLogGroupsCommand,
  LogGroup,
} from "@aws-sdk/client-cloudwatch-logs";

import { cloudWatchLogsClient } from "../clients/cloudWatchLogsClient";
import { testStartTime } from "../tests/sns-lambda-tests";
import { waitForTrue } from "../helpers/commonHelpers";

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
  console.log("**Log GroupName**", name);
  return name;
}

async function checkEventExistsInLogs(logName: string, eventid: string) {
  const params: FilterLogEventsCommandInput = {
    logGroupName: await getLogGroupName(logName),
    startTime: testStartTime,
  };

  const checkEventExists = async () => {
    const response: FilterLogEventsCommandOutput =
      await cloudWatchLogsClient.send(new FilterLogEventsCommand(params));
    return response.events?.some((x) => x.message?.includes(eventid));
  };
  const eventIdExists = await waitForTrue(checkEventExists, 3000, 15000);
  return eventIdExists;
}

export { checkEventExistsInLogs, getLogGroupName };
