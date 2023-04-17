import { snsValidEventPayload } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  startQueryExecutionCommand,
  waitAndGetQueryResults,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";
import { generateAndCheckEventsInS3BucketViaFilterLambda } from "../../src/handlers/int-test-support/helpers/testDataHelper";

const prefix = resourcePrefix();

describe("\nPublish valid sns message and execute athena query\n", () => {
  beforeAll(async () => {
    await generateAndCheckEventsInS3BucketViaFilterLambda(snsValidEventPayload);
  });

  test("should contain eventId in the generated query results", async () => {
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${snsValidEventPayload.event_id}'`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryResult = await waitAndGetQueryResults(queryId);
    expect(JSON.stringify(queryResult?.ResultSet?.Rows)).toContain(
      snsValidEventPayload.event_id
    );
  });
});

describe("\nPublish invalid sns message and execute athena query\n", () => {
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
