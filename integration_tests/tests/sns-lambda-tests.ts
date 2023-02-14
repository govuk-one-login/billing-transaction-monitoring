import { PublishResponse } from "@aws-sdk/client-sns";
import {
  snsInvalidEventPayloadComponentId,
  snsInvalidEventPayloadEventId,
  snsInvalidEventPayloadEventName,
  snsInvalidEventPayloadTimeStamp,
  snsInvalidEventPayloadTimestampFormatted,
  snsValidEventPayload,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { checkGivenStringExistsInLogs } from "../../src/handlers/int-test-support/helpers/cloudWatchHelper";
import { waitForTrue } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { publishToTestTopic } from "../../src/handlers/int-test-support/helpers/snsHelper";

let snsResponse: PublishResponse;

const testStartTime = new Date().getTime();

const logNamePrefix = resourcePrefix();

async function checkAndWaitForStringInLogs(
  logName: string,
  expectedString: string,
  testStartTime: number,
  timeoutMs: number
): Promise<boolean> {
  const checkGivenStringExists = async (): Promise<boolean | undefined> => {
    return await checkGivenStringExistsInLogs({
      logName,
      expectedString,
      testStartTime,
    });
  };
  return await waitForTrue(checkGivenStringExists, 3000, timeoutMs);
}

describe(
  "\n Happy path tests \n" +
    "\n publish valid sns message and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n",
  () => {
    beforeAll(async () => {
      snsResponse = await publishToTestTopic(snsValidEventPayload);
    });

    test("Filter function cloud watch logs should contain eventid", async () => {
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkAndWaitForStringInLogs(
        logNamePrefix + "-filter-function",
        snsValidEventPayload.event_id,
        testStartTime,
        25000
      );
      expect(eventIdExists).toBeTruthy();
    });

    test("Clean function cloud watch logs should contain eventid", async () => {
      const eventIdExists = await checkAndWaitForStringInLogs(
        logNamePrefix + "-clean-function",
        snsValidEventPayload.event_id,
        testStartTime,
        25000
      );
      expect(eventIdExists).toBeTruthy();
    });

    test("Store Transactions function cloud watch logs should contain eventid", async () => {
      const eventIdExists = await checkAndWaitForStringInLogs(
        logNamePrefix + "-storage-function",
        snsValidEventPayload.event_id,
        testStartTime,
        60000
      );
      expect(eventIdExists).toBeTruthy();
    });
  }
);

describe(
  "\n Unhappy path tests \n" +
    "\n publish invalid SNS message and check cloud watch logs lambda functions not contain the eventId\n",
  () => {
    test("Filter function cloud watch logs should not contain eventid for sns message with invalid event name", async () => {
      snsResponse = await publishToTestTopic(snsInvalidEventPayloadEventName);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkAndWaitForStringInLogs(
        logNamePrefix + "-filter-function",
        snsInvalidEventPayloadEventName.event_id,
        testStartTime,
        10000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("Clean function cloud watch logs should not contain eventid for SNS message with invalid Timestamp in the payload", async () => {
      snsResponse = await publishToTestTopic(snsInvalidEventPayloadTimeStamp);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkAndWaitForStringInLogs(
        logNamePrefix + "-clean-function",
        snsInvalidEventPayloadTimeStamp.event_id,
        testStartTime,
        10000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("Clean function cloud watch logs should not contain eventid for SNS  message with invalid ComponentId in the payload", async () => {
      snsResponse = await publishToTestTopic(snsInvalidEventPayloadComponentId);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkAndWaitForStringInLogs(
        logNamePrefix + "-clean-function",
        snsInvalidEventPayloadComponentId.event_id,
        testStartTime,
        10000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("Clean function cloud watch logs should not contain eventid for SNS  message with invalid event id in the payload", async () => {
      snsResponse = await publishToTestTopic(snsInvalidEventPayloadEventId);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkAndWaitForStringInLogs(
        logNamePrefix + "-clean-function",
        snsInvalidEventPayloadEventId.event_id,
        testStartTime,
        10000
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("Clean function cloud watch logs should not contain eventid for SNS  message with invalid event id in the payload", async () => {
      snsResponse = await publishToTestTopic(
        snsInvalidEventPayloadTimestampFormatted
      );
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkAndWaitForStringInLogs(
        logNamePrefix + "-clean-function",
        snsInvalidEventPayloadTimestampFormatted.event_id,
        testStartTime,
        10000
      );
      expect(eventIdExists).toBeFalsy();
    });
  }
);
