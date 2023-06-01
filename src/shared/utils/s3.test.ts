import { mockClient } from "aws-sdk-client-mock";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
} from "@aws-sdk/client-s3";
import {
  deleteS3,
  fetchS3,
  getS3EventRecordsFromSqs,
  listS3Keys,
  moveS3,
  moveToFolderS3,
  putS3,
  putTextS3,
} from "./s3";

jest.mock("./logger");

let s3Mock: ReturnType<typeof mockClient>;

const bucket = "given-bucket-name";
const key = "given/key";
const record = { record: "given record" };

beforeEach(() => {
  s3Mock = mockClient(S3Client);
});

test("Put object with callback error", async () => {
  s3Mock.on(PutObjectCommand).rejects("An error");

  await expect(putS3(bucket, key, record)).rejects.toMatchObject({
    message: "An error",
  });
  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Body: JSON.stringify(record),
    Key: key,
    Bucket: bucket,
  });
});

test("Put text without callback error", async () => {
  s3Mock.on(PutObjectCommand).resolves({});

  const givenText = "given text";

  await putTextS3(bucket, key, givenText);

  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Body: givenText,
    Key: key,
    Bucket: bucket,
  });
});

test("Put text with callback error", async () => {
  s3Mock.on(PutObjectCommand).rejects("An error");

  const givenText = "given text";

  await expect(putTextS3(bucket, key, givenText)).rejects.toMatchObject({
    message: "An error",
  });
  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Body: givenText,
    Key: key,
    Bucket: bucket,
  });
});

test("Put object without callback error", async () => {
  s3Mock.on(PutObjectCommand).resolves({});

  await putS3(bucket, key, record);

  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Body: JSON.stringify(record),
    Key: key,
    Bucket: bucket,
  });
});

test("Delete object with callback error", async () => {
  s3Mock.on(DeleteObjectCommand).rejects("An error");

  await expect(deleteS3(bucket, key)).rejects.toMatchObject({
    message: "An error",
  });
  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Key: key,
    Bucket: bucket,
  });
});

test("Delete object without callback error", async () => {
  s3Mock.on(DeleteObjectCommand).resolves({});

  await deleteS3(bucket, key);

  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Key: key,
    Bucket: bucket,
  });
});

test("Move object with copy callback error", async () => {
  s3Mock.on(CopyObjectCommand).rejects("An error");

  const sourceBucket = "given-source-bucket-name";
  const sourceKey = "given/source/key";
  const destinationBucket = "given-destination-bucket-name";
  const destinationKey = "given/destination/key";

  await expect(
    moveS3(sourceBucket, sourceKey, destinationBucket, destinationKey)
  ).rejects.toMatchObject({
    message: "An error",
  });
  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Key: destinationKey,
    Bucket: destinationBucket,
    CopySource: `${sourceBucket}/${sourceKey}`,
  });
});

test("Move object with delete callback error", async () => {
  s3Mock.on(CopyObjectCommand).resolves({});
  s3Mock.on(DeleteObjectCommand).rejects("An error");

  const sourceBucket = "given-source-bucket-name";
  const sourceKey = "given/source/key";
  const destinationBucket = "given-destination-bucket-name";
  const destinationKey = "given/destination/key";

  await expect(
    moveS3(sourceBucket, sourceKey, destinationBucket, destinationKey)
  ).rejects.toMatchObject({
    message: "An error",
  });
  expect(s3Mock.calls()[1].firstArg.input).toEqual({
    Key: sourceKey,
    Bucket: sourceBucket,
  });
});

test("Move object without callback error", async () => {
  s3Mock.on(CopyObjectCommand).resolves({});
  s3Mock.on(DeleteObjectCommand).resolves({});

  const sourceBucket = "given-source-bucket-name";
  const sourceKey = "given/source/key";
  const destinationBucket = "given-destination-bucket-name";
  const destinationKey = "given/destination/key";

  await moveS3(sourceBucket, sourceKey, destinationBucket, destinationKey);

  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Key: destinationKey,
    Bucket: destinationBucket,
    CopySource: `${sourceBucket}/${sourceKey}`,
  });
  expect(s3Mock.calls()[1].firstArg.input).toEqual({
    Key: sourceKey,
    Bucket: sourceBucket,
  });
});

test("Move object not in folder to folder", async () => {
  s3Mock.on(CopyObjectCommand).resolves({});
  s3Mock.on(DeleteObjectCommand).resolves({});

  const bucket = "given-bucket-name";
  const key = "given-key";
  const folder = "given-folder";

  await moveToFolderS3(bucket, key, folder);

  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Key: `${folder}/${key}`,
    Bucket: bucket,
    CopySource: `${bucket}/${key}`,
  });
  expect(s3Mock.calls()[1].firstArg.input).toEqual({
    Key: key,
    Bucket: bucket,
  });
});

test("Move object in folder to another folder", async () => {
  s3Mock.on(CopyObjectCommand).resolves({});
  s3Mock.on(DeleteObjectCommand).resolves({});

  const bucket = "given-bucket-name";
  const fileName = "given-file-name";
  const key = `given-starting-folder/${fileName}`;
  const folder = "given-folder";

  await moveToFolderS3(bucket, key, folder);

  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Key: `${folder}/${fileName}`,
    Bucket: bucket,
    CopySource: `${bucket}/${key}`,
  });
  expect(s3Mock.calls()[1].firstArg.input).toEqual({
    Key: key,
    Bucket: bucket,
  });
});

test("Fetch object with callback error", async () => {
  s3Mock.on(GetObjectCommand).rejects("An error");

  await expect(fetchS3(bucket, key)).rejects.toMatchObject({
    message: "An error",
  });
  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Key: key,
    Bucket: bucket,
  });
});

test("Fetch object without callback error", async () => {
  const mockedObjectBodyString = "mocked object body string";
  s3Mock.on(GetObjectCommand).resolves({
    Body: {
      transformToString: () => mockedObjectBodyString,
    },
  } as any);

  const result = await fetchS3(bucket, key);

  expect(result).toBe(mockedObjectBodyString);
  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Key: key,
    Bucket: bucket,
  });
});

test("Fetch object with undefined error", async () => {
  s3Mock.on(GetObjectCommand).resolves({
    Body: {
      transformToString: () => undefined,
    },
  } as any);

  await expect(fetchS3(bucket, key)).rejects.toThrowError(
    `No data found in ${bucket}/${key}`
  );
});

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

describe("S3 keys lister tests", () => {
  let givenBucket: any;
  let givenPrefix: any;

  beforeEach(() => {
    givenBucket = "given bucket";
    givenPrefix = "given prefix";
  });

  test("S3 keys lister with callback error", async () => {
    const mockedErrorMessage = "mocked error message";
    const mockedError = new Error(mockedErrorMessage);
    s3Mock.on(ListObjectsCommand).rejects(mockedError);

    const resultPromise = listS3Keys(givenBucket, givenPrefix);

    await expect(resultPromise).rejects.toThrowError(mockedErrorMessage);
    expect(s3Mock.calls()[0].firstArg.input).toEqual({
      Bucket: givenBucket,
      Prefix: givenPrefix,
    });
  });

  test("S3 keys lister with undefined callback contents", async () => {
    s3Mock.on(ListObjectsCommand).resolves({ Contents: undefined });
    const result = await listS3Keys(givenBucket, givenPrefix);
    expect(result).toEqual([]);
  });

  test("S3 keys lister with some defined and some undefined callback content keys", async () => {
    const mockedDefinedKey1 = "mocked defined key 1";
    const mockedDefinedKey2 = "mocked defined key 2";
    const mockedContents = [
      { Key: mockedDefinedKey1 },
      { Key: undefined },
      { Key: mockedDefinedKey2 },
    ];
    s3Mock.on(ListObjectsCommand).resolves({ Contents: mockedContents });

    const result = await listS3Keys(givenBucket, givenPrefix);
    expect(result).toEqual([mockedDefinedKey1, mockedDefinedKey2]);
  });
});
