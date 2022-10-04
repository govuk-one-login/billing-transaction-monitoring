import { dynamoDBClient } from './clients/dynamoDbClient'
import { payload,snsParam, publishSNS} from './helpers/snsHelper';
import { getFilteredEventFromLatestLogStream } from './helpers/cloudWatchHelper'
import {PublishResponse } from "@aws-sdk/client-sns";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env["TABLENAME"];
//below E2E tests is marked as skipped as still development in progress
describe.skip("E2E tests", () => {
  test("Publish sns message and expect message to reach dynamoDB ", async () => {
    const response = await publishSNS(snsParam);
    const dynamoParams = {
      TableName: TABLE_NAME,
    };
    const data = await dynamoDBClient.send(new ScanCommand(dynamoParams));
    expect(JSON.stringify(data.Items)).toContain(snsParam.Message);
  });
});

describe("Publish SNS event and validate lambda functions triggered", () => {
  let snsResponse: PublishResponse;
  beforeAll(async () => {
    snsResponse = await publishSNS(snsParam);
  });

  test("publish  message and check filter function lambda triggered successfully", async () => {
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream();
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(payload.eventId.toString())
   });
});