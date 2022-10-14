import { snsParams, publishSNS } from "./helpers/snsHelper";
import { getFilteredEventFromLatestLogStream } from "./helpers/cloudWatchHelper";
import { PublishResponse } from "@aws-sdk/client-sns";
import { scanDB } from "./helpers/dynamoDBHelper";
import { waitForTrue } from "./helpers/commonHelpers";
import {
  snsValidEventPayload,
  snsInvalidEventNamePayload,
  snsEventMissingCompIdPayload,
  snsEventInvalidCompId,
  snsInvalidTimeStampPayload,
  snsEventMissingTimestampPayload,
  snsEventWithAdditionalFieldsPayload,
  snsMissingEventNamePayload,
  snsMissingEventIdPayload,
} from "./payloads/snsEventPayload";

let snsResponse: PublishResponse;

export const testStartTime = new Date().getTime();

describe("E2E tests", () => {
  test("Publish sns message and expect message to reach dynamoDB ", async () => {
    snsResponse = await publishSNS(snsValidEventPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await scanDB();
      console.log(snsValidEventPayload.event_id);
      return JSON.stringify(result.Items).includes(
        snsValidEventPayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
    expect(eventIdExists).toBeTruthy();
  });

  test("Publish sns event which has invalid event name and expect event not stored in the dynamoDB", async () => {
    snsResponse = await publishSNS(snsInvalidEventNamePayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await scanDB();
      console.log(snsInvalidEventNamePayload.event_id);
      return JSON.stringify(result.Items).includes(
        snsInvalidEventNamePayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which has invalid comp id and expect event not stored in the dynamoDB", async () => {
    snsResponse = await publishSNS(snsEventInvalidCompId);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await scanDB();
      return JSON.stringify(result.Items).includes(
        snsEventInvalidCompId.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which has invalid timestamp id and expect event not stored in the dynamoDB", async () => {
    snsResponse = await publishSNS(snsInvalidTimeStampPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await scanDB();
      return JSON.stringify(result.Items).includes(
        snsEventInvalidCompId.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which is missing timestamp and expect event not stored in the dynamoDB", async () => {
    snsResponse = await publishSNS(snsEventMissingTimestampPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await scanDB();
      return JSON.stringify(result.Items).includes(
        snsEventMissingTimestampPayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which is missing component id and expect event not stored in the dynamoDB", async () => {
    snsResponse = await publishSNS(snsEventMissingCompIdPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await scanDB();
      return JSON.stringify(result.Items).includes(
        snsEventMissingCompIdPayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which is missing event name and expect event not stored in the dynamoDB", async () => {
    snsResponse = await publishSNS(snsMissingEventNamePayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await scanDB();
      return JSON.stringify(result.Items).includes(
        snsMissingEventNamePayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which is missing event id and expect event not stored in the dynamoDB", async () => {
    snsResponse = await publishSNS(snsMissingEventIdPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await scanDB();
      return JSON.stringify(result.Items).includes(
        snsMissingEventNamePayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which has unwanted field and expect event not stored in the dynamoDB", async () => {
    snsResponse = await publishSNS(snsEventWithAdditionalFieldsPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await scanDB();
      return JSON.stringify(result.Items).includes(
        snsEventWithAdditionalFieldsPayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });
});

describe("Publish SNS event and validate lambda functions triggered", () => {
  beforeAll(async () => {
    snsResponse = await publishSNS(snsValidEventPayload);
  });

  test("publish valid sns event and check filter function lambda triggered successfully", async () => {
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-FilterFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish valid sns event and check clean function lambda triggered successfully", async () => {
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish valid sns event and check store function lambda triggered successfully", async () => {
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-StorageFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).toContain(
      snsValidEventPayload.event_id.toString()
    );
  });
});

describe("Publish invalid SNS event and validate errors raised in cloud watch logs", () => {
  test("publish sns event with invalid event name and validate no errors in filter function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsInvalidEventNamePayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-FilterFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).not.toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish sns event with invalid timestamp and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsInvalidTimeStampPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).not.toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish sns event with invalid component id and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsEventInvalidCompId);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).not.toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish sns event with some additional field and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsEventWithAdditionalFieldsPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).not.toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish sns event missing event name and validate no errors in filter function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsMissingEventNamePayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-FilterFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).not.toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish sns event missing component id and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsEventMissingCompIdPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).not.toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish sns event missing timstamp and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsEventMissingTimestampPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).not.toContain(
      snsValidEventPayload.event_id.toString()
    );
  });

  test("publish sns event missing event id and validate no errors in clean function cloudwatch logs", async () => {
    snsResponse = await publishSNS(snsMissingEventIdPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream(
      "di-btm-CleanFunction"
    );
    expect(JSON.stringify(logs)).not.toContain("ERROR");
    expect(JSON.stringify(logs)).not.toContain(
      snsValidEventPayload.event_id.toString()
    );
  });
});
