import { payload, snsParams, publishSNS } from "./helpers/snsHelper";
import {
  getFilteredEventFromLatestLogStream,
  getLogGroupName,
} from "./helpers/cloudWatchHelper";
import { PublishResponse } from "@aws-sdk/client-sns";
import { scanDB } from "./helpers/dynamoDBHelper";
import { ScanCommandOutput } from "@aws-sdk/client-dynamodb";

let snsResponse: PublishResponse;
let result: ScanCommandOutput;
let isEventIdExists: boolean;

describe("E2E tests", () => {
  beforeAll(async () => {
    snsResponse = await publishSNS(snsParams);
    expect(snsResponse).toHaveProperty("MessageId");
  });
  test("Publish sns message and expect message to reach dynamoDB ", async () => {
    let checkFlag = false;
    while (!checkFlag) {
      result = await scanDB();
      isEventIdExists = JSON.stringify(result.Items).includes(
        payload.event_id.toString()
      );
      if (isEventIdExists) {
        expect(JSON.stringify(result.Items)).toContain(payload.event_id);
      }
      setTimeout(() => {
        checkFlag = true;
      }, 5000);
    }
    expect(isEventIdExists).toBe(true);
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
    expect(JSON.stringify(logs)).toContain(payload.event_id.toString());
  });

  test("publish  message and check clean function lambda triggered successfully", async () => {
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(payload.event_id.toString());
  });

  test("publish  message and check clean function lambda triggered successfully", async () => {
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-StorageFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(payload.event_id.toString());
  });
});
