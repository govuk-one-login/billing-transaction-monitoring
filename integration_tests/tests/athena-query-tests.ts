import { publishSNS } from "../helpers/snsHelper";
import {
  getQueryResults,
  startQueryExecutionCommand,
} from "../helpers/athenaHelper";
import { getS3ItemsList } from "../helpers/s3Helper";
import { waitForTrue } from "../helpers/commonHelpers";
import { snsValidEventPayload } from "../payloads/snsEventPayload";
import { resourcePrefix } from "../helpers/envHelper";

const prefix = resourcePrefix();
const objectsPrefix = "btm_transactions";

describe("\nPublish valid sns message and execute athena query\n", () => {
  beforeAll(async () => {
    await publishSNS(snsValidEventPayload);
    const checkEventId = async () => {
      const result = await getS3ItemsList(`${prefix}-storage`, objectsPrefix);
      if (result.Contents !== undefined) {
        console.log("Storage bucket contents not empty");
        return JSON.stringify(result.Contents.map((data) => data.Key)).includes(
          snsValidEventPayload.event_id
        );
      } else {
        console.log("Storage bucket contents empty");
        return false;
      }
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
    expect(eventIdExists).toBeTruthy();
  });

  test("should contain eventId in the generated query results", async () => {
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM \"btm_transactions\" where event_id='${snsValidEventPayload.event_id}'`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryResult = await getQueryResults(queryId);
    expect(JSON.stringify(queryResult?.ResultSet?.Rows)).toContain(
      snsValidEventPayload.event_id
    );
  });
});

describe("\nPublish invalid sns message and execute athena query\n", () => {
  test("should not contain eventId in the generated query results", async () => {
    const databaseName = `${prefix}-calculations`;
    const invalidEventId = "12345";
    const queryString = `SELECT * FROM \"btm_transactions\" where event_id='${invalidEventId}'`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryResult = await getQueryResults(queryId);
    expect(JSON.stringify(queryResult?.ResultSet?.Rows)).not.toContain(
      invalidEventId
    );
  });
});
