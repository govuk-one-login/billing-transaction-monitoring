import { snsValidEventPayload } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { getRecentCloudwatchLogs } from "../../src/handlers/int-test-support/helpers/cloudWatchHelper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { generateAndCheckEventsInS3BucketViaFilterLambda } from "../../src/handlers/int-test-support/helpers/testDataHelper";

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
      !!results.events?.some((event) => {
        return event.message?.includes(subString);
      }),
    {
      nonCompleteErrorMessage: "Substring " + subString + " not found in logs",
    }
  );
}

describe(
  "\n Happy path tests \n" +
    "\n publish valid sns message and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n",
  () => {
    beforeAll(async () => {
      await generateAndCheckEventsInS3BucketViaFilterLambda(
        snsValidEventPayload
      );
    });

    test("Filter function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs(
        "-filter-function",
        snsValidEventPayload.event_id
      );
    });

    test("Clean function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs(
        "-clean-function",
        snsValidEventPayload.event_id
      );
    });

    test("Store Transactions function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs(
        "-storage-function",
        snsValidEventPayload.event_id
      );
    });
  }
);
