import { validEventPayload } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { getRecentCloudwatchLogs } from "../../src/handlers/int-test-support/helpers/cloudWatchHelper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { generateEventViaFilterLambdaAndCheckEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";
import {
  FILTER_FUNCTION,
  CLEAN_FUNCTION,
  STORE_FUNCTION,
} from "../../src/handlers/int-test-support/test-constants";

async function waitForSubstringInLogs(
  logName: string,
  subString: string
): Promise<void> {
  // If the substring appears in the logs then the poll is successful, and therefore the test will pass.
  await poll(
    async () =>
      await getRecentCloudwatchLogs({
        logName,
      }),

    (results) =>
      !!results.some((event) => {
        return event.message?.includes(subString);
      }),
    {
      notCompleteErrorMessage: "Substring " + subString + " not found in logs",
    }
  );
}

describe(
  "\n Happy path tests \n" +
    "\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n",
  () => {
    let eventId: string;

    beforeAll(async () => {
      const result = await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
        validEventPayload
      );
      if (result.eventId) {
        eventId = result.eventId;
      }
    });

    test("Filter function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs(FILTER_FUNCTION, eventId);
    });

    test("Clean function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs(CLEAN_FUNCTION, eventId);
    });

    test("Store Transactions function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs(STORE_FUNCTION, eventId);
    });
  }
);
