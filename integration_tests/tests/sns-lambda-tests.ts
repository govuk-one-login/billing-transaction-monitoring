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

export const testStartTime = new Date().getTime();

describe(
  "\n Happy path tests \n" +
    "\n publish valid sns message and check cloud watch logs lambda functions Filter,Clean, Store contains eventId\n",
  () => {
    beforeAll(async () => {
      snsResponse = await publishSNS(snsValidEventPayload);
    });

    test("Filter function cloud watch logs should contain eventid", async () => {
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
        "di-btm-FilterFunction",snsValidEventPayload.event_id
      );
     expect(eventIdExists).toBeTruthy()
    });

    test("Clean function cloud watch logs should contain eventid", async () => {
      const eventIdExists = await checkGivenStringExistsInLogs(
        "di-btm-CleanFunction",snsValidEventPayload.event_id
      );
      expect(eventIdExists).toBeTruthy()
    });

    test("Store function cloud watch logs should contain eventid", async () => {
      const eventIdExists = await checkGivenStringExistsInLogs(
        "di-btm-StorageFunction",snsValidEventPayload.event_id
      );
      expect(eventIdExists).toBeTruthy()
    });

    test("Clean function cloud watch logs should contain event id for SNS message with some additional field in the payload", async () => {
      snsResponse = await publishSNS(snsEventWithAdditionalFieldsPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
        "di-btm-CleanFunction",snsEventWithAdditionalFieldsPayload.event_id
      );
      expect(eventIdExists).toBeTruthy()
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
        "di-btm-FilterFunction",snsInvalidEventNamePayload.event_id
      );
      expect(eventIdExists).toBeFalsy()
    });

    test("Clean function cloud watch logs should not contain eventid for SNS message with invalid Timestamp in the payload", async () => {
      snsResponse = await publishSNS(snsInvalidTimeStampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
        "di-btm-CleanFunction",snsInvalidTimeStampPayload.event_id
      );
      expect(eventIdExists).toBeFalsy()
    });

    test("Clean function cloud watch logs should not contain eventid for SNS  message with invalid ComponentId in the payload", async () => {
      snsResponse = await publishSNS(snsEventInvalidCompId);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
        "di-btm-CleanFunction",snsEventInvalidCompId.event_id
      );
      expect(eventIdExists).toBeFalsy()
    });

    test("Filter function cloud watch logs should not contain event id for SNS message with missing EventName in the payload", async () => {
      snsResponse = await publishSNS(snsMissingEventNamePayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
        "di-btm-FilterFunction",snsMissingEventNamePayload.event_id
      );
      expect(eventIdExists).toBeFalsy()
    });

    test("Clean function cloud watch logs should not contain event id for SNS message with missing ComponentId in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingCompIdPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
        "di-btm-CleanFunction",snsEventMissingCompIdPayload.event_id
      );
      expect(eventIdExists).toBeFalsy()
   
    });

    test("Clean function cloud watch logs should not contain event id for SNS message with missing Timestamp in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingTimestampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const eventIdExists = await checkGivenStringExistsInLogs(
        "di-btm-CleanFunction",snsEventMissingTimestampPayload.event_id
      );
      expect(eventIdExists).toBeFalsy()
      
    });
  }
);


