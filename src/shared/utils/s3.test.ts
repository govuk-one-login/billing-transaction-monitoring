import { mockClient } from "aws-sdk-client-mock";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { deleteS3, putS3 } from "./s3";

let s3Mock: ReturnType<typeof mockClient>;

const oldConsoleLog = console.log;
const bucket = "given-bucket-name";
const key = "given/key";
const record = { record: "given record" };

beforeEach(() => {
  console.log = jest.fn();
  s3Mock = mockClient(S3Client);
});

afterAll(() => {
  console.log = oldConsoleLog;
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
