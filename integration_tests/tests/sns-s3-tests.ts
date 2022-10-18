import { publishSNS } from "../helpers/snsHelper";
import { PublishResponse } from "@aws-sdk/client-sns";
import { getS3ItemsList } from "../helpers/s3Helper";
import { waitForTrue } from "../helpers/commonHelpers";
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
} from "../payloads/snsEventPayload";

let snsResponse: PublishResponse;

describe("E2E tests", () => {
  test("Publish sns message and expect message to reach s3 ", async () => {
    snsResponse = await publishSNS(snsValidEventPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await getS3ItemsList();
      return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
        snsValidEventPayload.event_id
      );
    };

    const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeTruthy();
  });

  test("Publish sns event which has unwanted field and expect event stored in s3", async () => {
    snsResponse = await publishSNS(snsEventWithAdditionalFieldsPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await getS3ItemsList();
      return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
        snsEventWithAdditionalFieldsPayload.event_id
      );
    };

    const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeTruthy();
  });

  test("Publish sns event which has invalid event name and expect event not stored in the dynamoDB", async () => {
    snsResponse = await publishSNS(snsInvalidEventNamePayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await getS3ItemsList();
      return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
        snsInvalidEventNamePayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which has invalid comp id and expect event not stored in s3", async () => {
    snsResponse = await publishSNS(snsEventInvalidCompId);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await getS3ItemsList();
      return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
        snsEventInvalidCompId.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which has invalid timestamp id and expect event not stored in s3", async () => {
    snsResponse = await publishSNS(snsInvalidTimeStampPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await getS3ItemsList();
      return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
        snsInvalidTimeStampPayload.event_id
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
      const result = await getS3ItemsList();
      return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
        snsEventMissingTimestampPayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which is missing component id and expect event not stored in s3", async () => {
    snsResponse = await publishSNS(snsEventMissingCompIdPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await getS3ItemsList();
      return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
        snsEventMissingCompIdPayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which is missing event name and expect event not stored in s3", async () => {
    snsResponse = await publishSNS(snsMissingEventNamePayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await getS3ItemsList();
      return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
        snsMissingEventNamePayload.event_id
      );
    };
    const eventIdExists = await waitForTrue(checkEventId, 1000, 3000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeFalsy();
  });

  test("Publish sns event which is missing event id and expect event not stored in s3", async () => {
    snsResponse = await publishSNS(snsMissingEventIdPayload);
    expect(snsResponse).toHaveProperty("MessageId");
    const checkEventId = async () => {
      const result = await getS3ItemsList();
      console.log(JSON.stringify(result.Contents?.map((x) => x.Key)));
      return JSON.stringify(result.Contents?.map((x) => x.Key)).includes(
        "event-id=undefined"
      );
    };

    const eventIdExists = await waitForTrue(checkEventId, 1000, 5000);
    console.log(eventIdExists);
    expect(eventIdExists).toBeTruthy();
  });
});
