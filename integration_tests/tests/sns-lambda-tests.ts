import { publishSNS } from "../helpers/snsHelper";
import { getFilteredEventFromLatestLogStream } from "../helpers/cloudWatchHelper";
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
      const logs = await getFilteredEventFromLatestLogStream(
        "di-btm-FilterFunction"
      );
      expect(JSON.stringify(logs)).not.toContain("ERROR");
      expect(JSON.stringify(logs)).toContain(
        snsValidEventPayload.event_id.toString()
      );
    });

    test("Clean function cloud watch logs should contain eventid", async () => {
      const logs = await getFilteredEventFromLatestLogStream(
        "di-btm-CleanFunction"
      );
      expect(JSON.stringify(logs)).toContain(
        snsValidEventPayload.event_id.toString()
      );
    });

    test("Store function cloud watch logs should contain eventid", async () => {
      const logs = await getFilteredEventFromLatestLogStream(
        "di-btm-StorageFunction"
      );
      expect(JSON.stringify(logs)).not.toContain("ERROR");
      expect(JSON.stringify(logs)).toContain(
        snsValidEventPayload.event_id.toString()
      );
    });

    test("Clean function cloud watch logs should contain event id for SNS message with some additional field in the payload", async () => {
      snsResponse = await publishSNS(snsEventWithAdditionalFieldsPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const logs = await getFilteredEventFromLatestLogStream(
        "di-btm-CleanFunction"
      );
      expect(JSON.stringify(logs)).toContain(
        snsEventWithAdditionalFieldsPayload.event_id.toString()
      );
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
      const logs = await getFilteredEventFromLatestLogStream(
        "di-btm-FilterFunction"
      );
      expect(JSON.stringify(logs)).not.toContain("ERROR");
      expect(JSON.stringify(logs)).not.toContain(
        snsInvalidEventNamePayload.event_id.toString()
      );
    });

    test("Clean function cloud watch logs should not contain eventid for SNS message with invalid Timestamp in the payload", async () => {
      snsResponse = await publishSNS(snsInvalidTimeStampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const logs = await getFilteredEventFromLatestLogStream(
        "di-btm-CleanFunction"
      );
      expect(JSON.stringify(logs)).not.toContain(
        snsInvalidTimeStampPayload.event_id.toString()
      );
    });

    test("Clean function cloud watch logs should not contain eventid for SNS  message with invalid ComponentId in the payload", async () => {
      snsResponse = await publishSNS(snsEventInvalidCompId);
      expect(snsResponse).toHaveProperty("MessageId");
      const logs = await getFilteredEventFromLatestLogStream(
        "di-btm-CleanFunction"
      );
      expect(JSON.stringify(logs)).not.toContain(
        snsEventInvalidCompId.event_id.toString()
      );
    });

    test("Filter function cloud watch logs should not contain event id for SNS message with missing EventName in the payload", async () => {
      snsResponse = await publishSNS(snsMissingEventNamePayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const logs = await getFilteredEventFromLatestLogStream(
        "di-btm-FilterFunction"
      );
      expect(JSON.stringify(logs)).not.toContain("ERROR");
      expect(JSON.stringify(logs)).not.toContain(
        snsMissingEventNamePayload.event_id.toString()
      );
    });

    test("Clean function cloud watch logs should not contain event id for SNS message with missing ComponentId in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingCompIdPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const logs = await getFilteredEventFromLatestLogStream(
        "di-btm-CleanFunction"
      );
      expect(JSON.stringify(logs)).not.toContain(
        snsEventMissingCompIdPayload.event_id.toString()
      );
    });

    test("Clean function cloud watch logs should not contain event id for SNS message with missing Timestamp in the payload", async () => {
      snsResponse = await publishSNS(snsEventMissingTimestampPayload);
      expect(snsResponse).toHaveProperty("MessageId");
      const logs = await getFilteredEventFromLatestLogStream(
        "di-btm-CleanFunction"
      );
      expect(JSON.stringify(logs)).not.toContain(
        snsEventMissingTimestampPayload.event_id.toString()
      );
    });
  }
);
