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
const storage_s3_bucketPrefix = "btm_transactions";

describe("\nPublish valid sns message and execute athena query\n", () => {
  beforeAll(async () => {
    await publishSNS(snsValidEventPayload);
    const checkEventId = async () => {
      const result = await getS3ItemsList(
        `${prefix}-storage`,
        storage_s3_bucketPrefix
      );
      return JSON.stringify(result.Contents?.map((data) => data.Key)).includes(
        snsValidEventPayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
    expect(eventIdExists).toBeTruthy();
  });

  test("should contain eventId in the generated query results", async () => {
    const queryId = await startQueryExecutionCommand(snsValidEventPayload.event_id);
    const queryResult = await getQueryResults(queryId);
    expect(queryResult).toContain(snsValidEventPayload.event_id);
  });
});

describe("\nPublish invalid sns message and execute athena query\n", () => {
  test("should not contain eventId in the generated query results", async () => {
    const invalidEventId = "12345";
    const queryId = await startQueryExecutionCommand(invalidEventId);
    const queryResult = await getQueryResults(queryId);
    expect(queryResult).not.toContain(invalidEventId);
  });
});
