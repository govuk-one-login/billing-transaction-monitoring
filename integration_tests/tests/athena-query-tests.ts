import { publishSNS } from "../helpers/snsHelper";
import { PublishResponse, SNSClient } from "@aws-sdk/client-sns";
import {
  getQueryResults,
  startQueryExecutionCommand,
} from "../helpers/athenaHelper";
import { getS3ItemsList } from "../helpers/s3Helper";
import { waitForTrue } from "../helpers/commonHelpers";
import { snsValidEventPayload } from "../payloads/snsEventPayload";

let snsResponse: PublishResponse;

describe("\nPublish valid sns message and excute athena query\n", () => {
  beforeAll(async () => {
    snsResponse = await publishSNS(snsValidEventPayload);
    const checkEventId = async () => {
      const result = await getS3ItemsList();
      return JSON.stringify(result.Contents?.map((data) => data.Key)).includes(
        snsValidEventPayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
    expect(eventIdExists).toBeTruthy();
  });

  test("should contain eventId in the generated query results", async () => {
    await startQueryExecutionCommand(snsValidEventPayload.event_id);
    const queryResult = await getQueryResults();
    expect(queryResult).toContain(snsValidEventPayload.event_id);
  });
});

describe("\nPublish invalid sns message and excute athena query\n", () => {
  test("should not contain eventId in the generated query results", async () => {
    const invalidEventId = "12345";
    await startQueryExecutionCommand(invalidEventId);
    const queryResult = await getQueryResults();
    expect(queryResult).not.toContain(invalidEventId);
  });
});
