import { snsValidEventPayload } from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import { publishToTestTopic } from "../../src/handlers/int-test-support/helpers/snsHelper";
import { listS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";
import { waitForTrue } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  startQueryExecutionCommand,
  waitAndGetQueryResults,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";

const prefix = resourcePrefix();
const objectsPrefix = "btm_transactions";

describe("\nPublish valid sns message and execute athena query\n", () => {
  beforeAll(async () => {
    await publishToTestTopic(snsValidEventPayload);
    const checkEventId = async (): Promise<boolean> => {
      const result = await listS3Objects({
        bucketName: `${prefix}-storage`,
        prefix: objectsPrefix,
      });
      if (result.Contents !== undefined) {
        return JSON.stringify(result.Contents.map((data) => data.Key)).includes(
          snsValidEventPayload.event_id
        );
      } else {
        return false;
      }
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 10000);
    expect(eventIdExists).toBeTruthy();
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
