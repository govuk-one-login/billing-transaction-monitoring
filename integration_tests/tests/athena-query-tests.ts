import {
  invalidEventPayloadEventName,
  validEventPayload,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { generateEventViaFilterLambdaAndCheckEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";

describe("\nGenerate valid event and execute athena query\n", () => {
  test("should contain eventId in the generated query results", async () => {
    const { eventId } =
      await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
        validEventPayload
      );
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${eventId}'`;
    const queryResult = await queryAthena(queryString);
    expect(JSON.stringify(queryResult)).toContain(eventId);
  });
});

describe("\nGenerate invalid event and execute athena query\n", () => {
  test("should not contain eventId in the generated query results", async () => {
    const { eventId } =
      await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
        invalidEventPayloadEventName
      );
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${eventId}'`;
    const queryResult = await queryAthena(queryString);
    expect(JSON.stringify(queryResult)).not.toContain(eventId);
  });
});
