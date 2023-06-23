import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  CleanedEventPayload,
  invalidEventPayloadComponentId,
  invalidEventPayloadTimeStamp,
  invalidEventPayloadTimestampFormatted,
  validEventPayload,
  validEventPayloadWithSortedValue,
  validEventPayloadWithSortedValueNA,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import {
  S3Object,
  getS3Object,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { invokeCleanLambdaAndVerifyEventInS3Bucket } from "../../src/handlers/int-test-support/helpers/testDataHelper";

describe("\n Clean Function - Happy path tests\n", () => {
  const retrieveS3ObjectByEventId = async (
    eventId: string
  ): Promise<CleanedEventPayload> => {
    const s3Object: S3Object = {
      bucket: `${resourcePrefix()}-storage`,
      key: `btm_event_data/2005/01/30/${eventId}.json`,
    };
    const objectData = await getS3Object(s3Object);
    if (objectData === undefined) {
      throw new Error(`No data found in ${s3Object.bucket}/${s3Object.key}`);
    }
    const parsedObject = JSON.parse(objectData);
    return parsedObject;
  };

  test.each([
    [validEventPayload, 1],
    [validEventPayloadWithSortedValueNA, 1],
    [validEventPayloadWithSortedValue, 2],
  ])(
    "should store cleaned events in the storage bucket and check credit field value",
    async (payload, expectedCredits) => {
      const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(payload);
      expect(result.success).toBe(true);
      expect(result.eventId).toBe(payload.event_id);
      const s3ObjectData = await retrieveS3ObjectByEventId(payload.event_id);
      expect(s3ObjectData.credits).toBe(expectedCredits);
    }
  );
});

describe("\n Clean Function - Unhappy path tests\n", () => {
  test("should not store event with invalid ComponentId in the storage bucket", async () => {
    const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
      invalidEventPayloadComponentId
    );
    expect(result.success).toBe(false);
  });

  test("should not store event with invalid Timestamp in the storage bucket", async () => {
    const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
      invalidEventPayloadTimeStamp
    );
    expect(result.success).toBe(false);
  });

  test("should not store event with invalid timestamp formatted in the storage bucket", async () => {
    const result = await invokeCleanLambdaAndVerifyEventInS3Bucket(
      invalidEventPayloadTimestampFormatted
    );
    expect(result.success).toBe(false);
  });
});
