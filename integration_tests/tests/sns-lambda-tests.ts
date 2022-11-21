import { publishSNS } from "../helpers/snsHelper";
import { checkGivenStringExistsInLogs } from "../helpers/cloudWatchHelper";
import { PublishResponse } from "@aws-sdk/client-sns";
import {
  snsValidEventPayload,
  snsInvalidEventNamePayload,
  snsEventMissingCompIdPayload,
  snsEventInvalidCompId,
  snsInvalidTimeStampPayload,
  snsEventMissingTimestampPayload,
  snsEventWithAdditionalFieldsPayload,
  snsMissingEventNamePayload,
} from "../payloads/snsEventPayload";

let snsResponse: PublishResponse;

const testStartTime = new Date().getTime();

const logNamePrefix = process.env.ENV_PREFIX;

describe(
  "\n Happy path tests \n" +
    "\n publish valid sns message and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n",
  () => {
    beforeAll(async () => {
      snsResponse = await publishSNS(snsValidEventPayload);
    });

    test("Filter function cloud watch logs should contain eventid", async () => {
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
        logNamePrefix + "-filter-function",
        snsValidEventPayload.event_id,
        testStartTime
      );
      expect(eventIdExists).toBeTruthy();
    });

    test("Clean function cloud watch logs should contain eventid", async () => {
      const eventIdExists = await checkGivenStringExistsInLogs(
        logNamePrefix + "-clean-function",
        snsValidEventPayload.event_id,
        testStartTime
      );
      expect(eventIdExists).toBeTruthy();
    });

    test("Store Transactions function cloud watch logs should contain eventid", async () => {
      const eventIdExists = await checkGivenStringExistsInLogs(
  logNamePrefix + "-storage-function",
        snsValidEventPayload.event_id,
        testStartTime
      );
      expect(eventIdExists).toBeTruthy();
    });

    test("Clean function cloud watch logs should contain event id for SNS message with some additional field in the payload", async () => {
      snsResponse = await publishSNS(snsEventWithAdditionalFieldsPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
  logNamePrefix + "-clean-function",
        snsEventWithAdditionalFieldsPayload.event_id,
        testStartTime
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
      snsResponse = await publishSNS(snsInvalidEventNamePayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
  logNamePrefix + "-filter-function",
        snsInvalidEventNamePayload.event_id,
        testStartTime
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("Clean function cloud watch logs should not contain eventid for SNS message with invalid Timestamp in the payload", async () => {
      snsResponse = await publishSNS(snsInvalidTimeStampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
  logNamePrefix + "-clean-function",
        snsInvalidTimeStampPayload.event_id,
        testStartTime
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("Clean function cloud watch logs should not contain eventid for SNS  message with invalid ComponentId in the payload", async () => {
      snsResponse = await publishSNS(snsEventInvalidCompId);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
  logNamePrefix + "-clean-function",
        snsEventInvalidCompId.event_id,
        testStartTime
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("Filter function cloud watch logs should not contain event id for SNS message with missing EventName in the payload", async () => {
      snsResponse = await publishSNS(snsMissingEventNamePayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
  logNamePrefix + "-filter-function",
        snsMissingEventNamePayload.event_id,
        testStartTime
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("Clean function cloud watch logs should not contain event id for SNS message with missing ComponentId in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingCompIdPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
  logNamePrefix + "-clean-function",
        snsEventMissingCompIdPayload.event_id,
        testStartTime
      );
      expect(eventIdExists).toBeFalsy();
    });

    test("Clean function cloud watch logs should not contain event id for SNS message with missing Timestamp in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingTimestampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
  logNamePrefix + "-clean-function",
        snsEventMissingTimestampPayload.event_id,
        testStartTime
      );
      expect(eventIdExists).toBeFalsy();
    });
  }
);
