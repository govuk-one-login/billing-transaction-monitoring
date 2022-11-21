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

async function checkGivenStringExistsInLogs(
  logName: string,
  expectedString: string,
  testStartTime: number
) {
  const params: FilterLogEventsCommandInput = {
    logGroupName: await getLogGroupName(logName),
    startTime: testStartTime,
  };

  const checkGivenStringExists = async () => {
    const response: FilterLogEventsCommandOutput =
      await cloudWatchLogsClient.send(new FilterLogEventsCommand(params));
    return response.events?.some((x) => x.message?.includes(expectedString));
  };
  const expectedStringExists = await waitForTrue(
    checkGivenStringExists,
    3000,
    15000
  );
  return expectedStringExists;
}

export { checkGivenStringExistsInLogs, getLogGroupName };
