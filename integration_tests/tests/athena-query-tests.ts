import {
  invalidEventPayloadEventName,
  validEventPayload,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  startQueryExecutionCommand,
  waitAndGetQueryResults,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";
import { generateEventViaFilterLambdaAndCheckEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

const prefix = resourcePrefix();

describe("\nGenerate valid event and execute athena query\n", () => {
  test("should contain eventId in the generated query results", async () => {
    const { eventId } =
      await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
        validEventPayload
      );
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${eventId}'`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryResult = await waitAndGetQueryResults(queryId);
    expect(JSON.stringify(queryResult)).toContain(eventId);
  });
});

describe("\nGenerate invalid event and execute athena query\n", () => {
  test("should not contain eventId in the generated query results", async () => {
    const { eventId } =
      await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
        invalidEventPayloadEventName
      );
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${eventId}'`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryResult = await waitAndGetQueryResults(queryId);
    expect(JSON.stringify(queryResult)).not.toContain(eventId);
  });
});
