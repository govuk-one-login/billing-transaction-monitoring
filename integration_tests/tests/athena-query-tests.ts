import { validEventPayload } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  startQueryExecutionCommand,
  waitAndGetQueryResults,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";
import { generateEventViaFilterLambdaAndCheckEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

const prefix = resourcePrefix();

describe("\nGenerate valid event and execute athena query\n", () => {
  beforeAll(async () => {
    await generateEventViaFilterLambdaAndCheckEventInS3Bucket(
      validEventPayload
    );
  });

  test("should contain eventId in the generated query results", async () => {
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${validEventPayload.event_id}'`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryResult = await waitAndGetQueryResults(queryId);
    expect(JSON.stringify(queryResult?.ResultSet?.Rows)).toContain(
      validEventPayload.event_id
    );
  });
});

describe("\nGenerate invalid event and execute athena query\n", () => {
  test("should not contain eventId in the generated query results", async () => {
    const databaseName = `${prefix}-calculations`;
    const invalidEventId = "12345";
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${invalidEventId}'`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryResult = await waitAndGetQueryResults(queryId);
    expect(JSON.stringify(queryResult?.ResultSet?.Rows)).not.toContain(
      invalidEventId
    );
  });
});
