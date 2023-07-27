import {
  invalidEventPayloadEventName,
  validEventPayload,
  validEventPayloadOneHourBeforeJanuaryUtc,
  validEventPayloadOneHourBeforeAugustUtc,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { invokeFilterLambdaAndVerifyEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

describe("\nGenerate valid event and execute athena query\n", () => {
  test("should contain eventId in the generated query results", async () => {
    const { eventId } = await invokeFilterLambdaAndVerifyEventInS3Bucket(
      validEventPayload
    );
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${eventId}'`;
    const queryResult = await queryAthena(queryString);
    expect(JSON.stringify(queryResult)).toContain(eventId);
  });
});

describe("\nGenerate valid event one hour before August UTC and execute athena query\n", () => {
  test("should contain eventId in the generated query results for August", async () => {
    const { eventId } = await invokeFilterLambdaAndVerifyEventInS3Bucket(
      validEventPayloadOneHourBeforeAugustUtc
    );
    const queryString = `SELECT * FROM "btm_transactions_standardised" where month='08'`;
    const queryResult = await queryAthena(queryString);
    expect(JSON.stringify(queryResult)).toContain(eventId);
  });
});

describe("\nGenerate valid event one hour before January UTC and execute athena query\n", () => {
  test("should not contain eventId in the generated query results for January", async () => {
    const { eventId } = await invokeFilterLambdaAndVerifyEventInS3Bucket(
      validEventPayloadOneHourBeforeJanuaryUtc
    );
    const queryString = `SELECT * FROM "btm_transactions_standardised" where month='01'`;
    const queryResult = await queryAthena(queryString);
    expect(JSON.stringify(queryResult)).not.toContain(eventId);
  });
});

describe("\nGenerate invalid event and execute athena query\n", () => {
  test("should not contain eventId in the generated query results", async () => {
    const { eventId } = await invokeFilterLambdaAndVerifyEventInS3Bucket(
      invalidEventPayloadEventName
    );
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${eventId}'`;
    const queryResult = await queryAthena(queryString);
    expect(JSON.stringify(queryResult)).not.toContain(eventId);
  });
});
