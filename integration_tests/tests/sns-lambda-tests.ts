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

describe("Publish SNS event and validate lambda functions triggered", () => {
  beforeAll(async () => {
    snsResponse = await publishSNS(snsValidEventPayload);
  });

  test("publish valid sns event and check filter function lambda triggered successfully", async () => {
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-FilterFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish valid sns event and check clean function lambda triggered successfully", async () => {
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish valid sns event and check store function lambda triggered successfully", async () => {
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-StorageFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(
      snsValidEventPayload.event_id.toString()
    );
  });
});

describe("Publish invalid SNS event and validate errors raised in cloud watch logs", () => {
  test("publish sns event with invalid event name and validate no errors in filter function cloudwatch logs", async () => {
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

  test("publish sns event with invalid timestamp and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsInvalidTimeStampPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain(
      snsInvalidTimeStampPayload.event_id.toString()
    );
  });

  test("publish sns event with invalid component id and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsEventInvalidCompId);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain(
      snsEventInvalidCompId.event_id.toString()
    );
  });

  test("publish sns event with some additional field and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsEventWithAdditionalFieldsPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).toContain(
      snsEventWithAdditionalFieldsPayload.event_id.toString()
    );
  });

  test("publish sns event missing event name and validate no errors in filter function cloudwatch logs", async () => {
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

  test("publish sns event missing component id and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsEventMissingCompIdPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain(
      snsEventMissingCompIdPayload.event_id.toString()
    );
  });

  test("publish sns event missing timestamp and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsEventMissingTimestampPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain(
      snsEventMissingTimestampPayload.event_id.toString()
    );
  });
});
