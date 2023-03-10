import { snsValidEventPayload } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { getRecentCloudwatchLogs } from "../../src/handlers/int-test-support/helpers/cloudWatchHelper";
import {
  deleteS3Event,
  poll,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { publishToTestTopic } from "../../src/handlers/int-test-support/helpers/snsHelper";

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
      await publishToTestTopic(snsValidEventPayload);
    });

    test("Filter function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs(
        "-filter-function",
        snsValidEventPayload.event_id
      );
      const eventTime = new Date(
        snsValidEventPayload.timestamp * 1000
      ).toISOString();
      await deleteS3Event(snsValidEventPayload.event_id, eventTime);
    });

    test("Clean function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs(
        "-clean-function",
        snsValidEventPayload.event_id
      );
      const eventTime = new Date(
        snsValidEventPayload.timestamp * 1000
      ).toISOString();
      await deleteS3Event(snsValidEventPayload.event_id, eventTime);
    });

    test("Store Transactions function cloud watch logs should contain eventid", async () => {
      await waitForSubstringInLogs(
        "-storage-function",
        snsValidEventPayload.event_id
      );
      const eventTime = new Date(
        snsValidEventPayload.timestamp * 1000
      ).toISOString();
      await deleteS3Event(snsValidEventPayload.event_id, eventTime);
    });
    afterEach(async () => {
      const eventTime = new Date(
        snsValidEventPayload.timestamp * 1000
      ).toISOString();
      await deleteS3Event(snsValidEventPayload.event_id, eventTime);
    });
  }
);
