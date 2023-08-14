import { validEventPayload } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { getRecentCloudwatchLogs } from "../../src/handlers/int-test-support/helpers/cloudWatchHelper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { sendEventAndVerifyInDataStore } from "../../src/handlers/int-test-support/helpers/testDataHelper";
import { Queue } from "../../src/handlers/int-test-support/helpers/sqsHelper";

const logNamePrefix = resourcePrefix();

async function waitForSubstringInLogs(
  logName: string,
  subString: string
): Promise<void> {
  // If the substring appears in the logs then the poll is successful, and therefore the test will pass.
  await poll(
    async () =>
      await getRecentCloudwatchLogs({
        logName: logNamePrefix + logName,
      }),

    (results) =>
      !!results.some((event) => {
        return event.message?.includes(subString);
      }),
    {
      timeout: 60000,
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
      const result = await sendEventAndVerifyInDataStore(
        validEventPayload,
        Queue.FILTER
      );
      if (result.eventId) {
        eventId = result.eventId;
      }
    });

    test("Filter function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs("-filter-function", eventId);
    });

    test("Clean function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs("-clean-function", eventId);
    });

    test("Store Transactions function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs("-storage-function", eventId);
    });
  }
);
