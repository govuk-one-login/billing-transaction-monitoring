import {
  FilterLogEventsCommandInput,
  FilterLogEventsCommandOutput,
  FilterLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

import { cloudWatchLogsClient } from "../clients/cloudWatchLogsClient";
import { waitForTrue } from "./commonHelpers";

async function checkGivenStringExistsInLogs(
  logName: string,
  expectedString: string,
  testStartTime: number
) {
  const params: FilterLogEventsCommandInput = {
    logGroupName: "/aws/lambda/" + logName,
    startTime: testStartTime,
  };

  const checkGivenStringExists = async (): Promise<boolean | undefined> => {
    const response: FilterLogEventsCommandOutput =
      await cloudWatchLogsClient.send(new FilterLogEventsCommand(params));
    return response.events?.some((x) => x.message?.includes(expectedString));
  };
  const expectedStringExists = await waitForTrue(
    checkGivenStringExists,
    3000,
    25000
  );
  return expectedStringExists;
}

export { checkGivenStringExistsInLogs };
