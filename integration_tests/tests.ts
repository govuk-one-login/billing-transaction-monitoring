import { payload, snsParams, publishSNS } from "./helpers/snsHelper";
import {getFilteredEventFromLatestLogStream} from "./helpers/cloudWatchHelper";
import { PublishResponse } from "@aws-sdk/client-sns";
import { scanDB } from "./helpers/dynamoDBHelper";

let snsResponse: PublishResponse;

function waitForTrue(predicate: Function, delayMS: number, timeoutMS: number){
  let intervalHandle: any;
  return new Promise((resultGenerated) => {
    const complete = (result: boolean) => {
      clearInterval(intervalHandle);
      resultGenerated(result);
    }
    intervalHandle = setInterval(() => predicate() && complete(true), delayMS);
    setTimeout(() => complete(false), timeoutMS);
  });
}

describe("E2E tests", () => {
  beforeAll(async () => {
    snsResponse = await publishSNS(snsParams);
    expect(snsResponse).toHaveProperty("MessageId");
  });

  test("Publish sns message and expect message to reach dynamoDB ", async () => {
    const checkEventId = async () => {
      const result = await scanDB();
      return JSON.stringify(result.Items).includes(payload.event_id.toString());
    }

    const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
    expect(eventIdExists).toBeTruthy();
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
