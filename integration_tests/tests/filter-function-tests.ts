import {
  invalidEventPayloadEventName,
  validEventPayload,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { sendEventAndVerifyInDataStore } from "../../src/handlers/int-test-support/helpers/testDataHelper";
import { Queue } from "../../src/handlers/int-test-support/helpers/sqsHelper";

describe("\n Filter function - Happy path tests\n", () => {
  test("should store event in the storage bucket for a valid event", async () => {
    const result = await sendEventAndVerifyInDataStore(
      validEventPayload,
      Queue.FILTER
    );
    expect(result.success).toBe(true);
    expect(result.eventId).toBe(validEventPayload.event_id);
  });
});

describe("\n Filter Function - Unhappy path tests\n", () => {
  test("should not store events with invalid EventName in the storage bucket", async () => {
    const result = await sendEventAndVerifyInDataStore(
      invalidEventPayloadEventName,
      Queue.FILTER
    );
    expect(result.success).toBe(false);
  });
});
