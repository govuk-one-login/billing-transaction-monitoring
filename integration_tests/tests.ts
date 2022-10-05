import { payload, snsParam, publishSNS } from "./helpers/snsHelper";
import { getFilteredEventFromLatestLogStream } from "./helpers/cloudWatchHelper";
import { PublishResponse } from "@aws-sdk/client-sns";
import { scanDB } from "./helpers/dynamoDBHelper";
import {
  filter_function_log_groupName,
  clean_function_log_groupName,
  store_function_log_groupName,
} from "./setup/testEnvVar";

let snsResponse: PublishResponse;

//below E2E tests is marked as skipped as still development in progress
describe.skip("E2E tests", () => {
  beforeAll(async () => {
    snsResponse = await publishSNS(snsParam);
    expect(snsResponse).toHaveProperty("MessageId");
  });
  test("Publish sns message and expect message to reach dynamoDB ", async () => {
    const data = await scanDB();
    expect(JSON.stringify(data.Items)).toContain(snsParam.Message);
  });
});

describe("Publish SNS event and validate lambda functions triggered", () => {
  beforeAll(async () => {
    snsResponse = await publishSNS(snsParam);
  });

  test("publish  message and check filter function lambda triggered successfully", async () => {
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      filter_function_log_groupName
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(payload.eventId.toString());
  });

  test("publish  message and check clean function lambda triggered successfully", async () => {
    const logs = await getFilteredEventFromLatestLogStream(
      clean_function_log_groupName
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(payload.eventId.toString());
  });

  //currently marked this test to skip as there are no log groups for store lambda function
  test.skip("publish  message and check clean function lambda triggered successfully", async () => {
    const logs = await getFilteredEventFromLatestLogStream(
      store_function_log_groupName
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(payload.eventId.toString());
  });
});
