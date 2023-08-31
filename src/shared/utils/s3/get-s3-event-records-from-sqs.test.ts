import { getS3EventRecordsFromSqs } from "./get-s3-event-records-from-sqs";

describe("S3 event records getter tests", () => {
  let givenBody: any;
  let givenQueueRecord: any;

  beforeEach(() => {
    givenBody = {
      Records: [
        {
          s3: {
            bucket: {
              name: "given bucket name",
            },
            object: {
              key: "given object key",
            },
          },
        },
      ],
    };

    givenQueueRecord = { body: JSON.stringify(givenBody) };
  });

  test("S3 event records getter with invalid body JSON", () => {
    givenQueueRecord.body = "{";
    expect(() => getS3EventRecordsFromSqs(givenQueueRecord)).toThrowError(
      "JSON"
    );
  });

  test("S3 event records getter with body JSON not object", () => {
    givenQueueRecord.body = "1234";
    expect(() => getS3EventRecordsFromSqs(givenQueueRecord)).toThrowError(
      "object"
    );
  });

  test("S3 event records getter with body records not array", () => {
    givenBody.Records = 1234;
    givenQueueRecord.body = JSON.stringify(givenBody);

    expect(() => getS3EventRecordsFromSqs(givenQueueRecord)).toThrowError(
      "S3 event"
    );
  });

  test("S3 event records getter with body record empty object", () => {
    givenBody.Records[0] = {};
    givenQueueRecord.body = JSON.stringify(givenBody);

    expect(() => getS3EventRecordsFromSqs(givenQueueRecord)).toThrowError(
      "S3 event"
    );
  });

  test("S3 event records getter with body record without bucket", () => {
    givenBody.Records[0].s3.bucket = undefined;
    givenQueueRecord.body = JSON.stringify(givenBody);

    expect(() => getS3EventRecordsFromSqs(givenQueueRecord)).toThrowError(
      "S3 event"
    );
  });

  test("S3 event records getter with body record bucket without name", () => {
    givenBody.Records[0].s3.bucket.name = undefined;
    givenQueueRecord.body = JSON.stringify(givenBody);

    expect(() => getS3EventRecordsFromSqs(givenQueueRecord)).toThrowError(
      "S3 event"
    );
  });

  test("S3 event records getter with body record without S3 object", () => {
    givenBody.Records[0].s3.object = undefined;
    givenQueueRecord.body = JSON.stringify(givenBody);

    expect(() => getS3EventRecordsFromSqs(givenQueueRecord)).toThrowError(
      "S3 event"
    );
  });

  test("S3 event records getter with body record S3 object without key", () => {
    givenBody.Records[0].s3.object.key = undefined;
    givenQueueRecord.body = JSON.stringify(givenBody);

    expect(() => getS3EventRecordsFromSqs(givenQueueRecord)).toThrowError(
      "S3 event"
    );
  });

  test("S3 event records getter with valid record", () => {
    const result = getS3EventRecordsFromSqs(givenQueueRecord);
    expect(result).toEqual(givenBody.Records);
  });
});
