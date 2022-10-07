import { payload, snsParams, publishSNS } from "./helpers/snsHelper";
import { getFilteredEventFromLatestLogStream, getLogGroupName } from "./helpers/cloudWatchHelper";
import { PublishResponse } from "@aws-sdk/client-sns";
import { scanDB } from "./helpers/dynamoDBHelper";

let snsResponse: PublishResponse;

//below E2E tests is marked as skipped as still development in progress
describe.skip("E2E tests", () => {
  beforeAll(async () => {
    snsResponse = await publishSNS(snsParams);
    expect(snsResponse).toHaveProperty("MessageId");
  });
  test("Publish sns message and expect message to reach dynamoDB ", async () => {
    const data = await scanDB();
    expect(JSON.stringify(data.Items)).toContain(snsParams.Message);
  });
});

describe("Publish SNS event and validate lambda functions triggered", () => {
  beforeAll(async () => {
    snsResponse = await publishSNS(snsParams);
  });

  test("publish  message and check filter function lambda triggered successfully", async () => {
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
     "di-btm-FilterFunction"
   );
   expect(JSON.stringify(logs)).not.toContain("ERROR");
   expect(JSON.stringify(logs)).toContain(payload.eventId.toString());
  });

  test("publish  message and check clean function lambda triggered successfully", async () => {
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(payload.eventId.toString());
  });

  //currently marked this test to skip as there are no log groups for store lambda function
  test.skip("publish  message and check clean function lambda triggered successfully", async () => {
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-StoreFunction"
      );
      expect(JSON.stringify(logs)).not.toContain("ERROR");
      expect(JSON.stringify(logs)).toContain(payload.eventId.toString());
    });
  });