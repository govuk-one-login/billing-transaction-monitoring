import crypto from "node:crypto";
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
  listS3Keys,
  moveS3,
  moveToFolderS3,
  putBytesS3,
  putS3,
  putTextS3,
} from "./base";
import { decryptKms } from "../kms";

jest.mock("../kms");
const mockedDecryptKms = decryptKms as jest.Mock;

jest.mock("../logger");

let s3Mock: ReturnType<typeof mockClient>;

const bucket = "given-bucket-name";
const key = "given/key";
const record = { record: "given record" };

beforeEach(() => {
  jest.resetAllMocks();
  s3Mock = mockClient(S3Client);
});

test("Put bytes without callback error", async () => {
  s3Mock.on(PutObjectCommand).resolves({});

  const givenBytes = crypto.randomBytes(123);

  await putBytesS3(bucket, key, givenBytes);

  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Body: givenBytes,
    Key: key,
    Bucket: bucket,
  });
});

test("Put bytes with callback error", async () => {
  s3Mock.on(PutObjectCommand).rejects("An error");

  const givenBytes = crypto.randomBytes(123);

  await expect(putBytesS3(bucket, key, givenBytes)).rejects.toMatchObject({
    message: "An error",
  });
  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Body: givenBytes,
    Key: key,
    Bucket: bucket,
  });
});

test("Put object with callback error", async () => {
  s3Mock.on(PutObjectCommand).rejects("An error");

  await expect(putS3(bucket, key, record)).rejects.toMatchObject({
    message: "An error",
  });
  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Body: Buffer.from(JSON.stringify(record)),
    Key: key,
    Bucket: bucket,
  });
});

test("Put text without callback error", async () => {
  s3Mock.on(PutObjectCommand).resolves({});

  const givenText = "given text";

  await putTextS3(bucket, key, givenText);

  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Body: Buffer.from(givenText),
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
    Body: Buffer.from(givenText),
    Key: key,
    Bucket: bucket,
  });
});

test("Put object without callback error", async () => {
  s3Mock.on(PutObjectCommand).resolves({});

  await putS3(bucket, key, record);

  expect(s3Mock.calls()[0].firstArg.input).toEqual({
    Body: Buffer.from(JSON.stringify(record)),
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
  s3Mock.on(GetObjectCommand).resolves({} as any);

  await expect(fetchS3(bucket, key)).rejects.toThrowError(
    `No data found in ${bucket}/${key}`
  );
});

describe("Fetch encrypted object", () => {
  let mockedAuthTagBitCountText: string;
  let mockedBody: string;
  let mockedEncryptedBytes: Uint8Array;
  let mockedEncryptedKey: string;
  let mockedEncryptionAlgorithmName: string;
  let mockedEncryptionKey: Uint8Array;
  let mockedEncryptionKeyContext: {};
  let mockedEncryptionKeyContextText: string;
  let mockedInitialisationVectorBase64Text: string;
  let mockedS3Response: any;

  beforeEach(() => {
    mockedBody = "mocked body";
    ({
      mockedAuthTagBitCountText,
      mockedEncryptedBytes,
      mockedEncryptionAlgorithmName,
      mockedEncryptionKey,
      mockedInitialisationVectorBase64Text,
    } = mockEncryptedS3ObjectData(mockedBody));
    mockedEncryptedKey = "mocked encrypted key";
    mockedEncryptionKeyContext = { foo: "bar" };
    mockedEncryptionKeyContextText = JSON.stringify(mockedEncryptionKeyContext);
    mockedDecryptKms.mockResolvedValue(mockedEncryptionKey);
    mockedS3Response = {
      Body: {
        transformToByteArray: async () => mockedEncryptedBytes,
      },
      Metadata: {
        "x-amz-cek-alg": mockedEncryptionAlgorithmName,
        "x-amz-iv": mockedInitialisationVectorBase64Text,
        "x-amz-key-v2": mockedEncryptedKey,
        "x-amz-matdesc": mockedEncryptionKeyContextText,
        "x-amz-tag-len": mockedAuthTagBitCountText,
      },
    };
    s3Mock.on(GetObjectCommand).resolves(mockedS3Response);
  });

  it("Fetch encrypted object", async () => {
    const result = await fetchS3(bucket, key);

    expect(result).toBe(mockedBody);
    expect(mockedDecryptKms).toHaveBeenCalledTimes(1);
    expect(mockedDecryptKms).toHaveBeenCalledWith(
      Buffer.from(mockedEncryptedKey, "base64"),
      mockedEncryptionKeyContext
    );
  });

  it("Fetch encrypted object with invalid encryption algorithm", async () => {
    mockedS3Response.Metadata["x-amz-cek-alg"] =
      "mocked invalid encryption algorithm name";

    const resultPromise = fetchS3(bucket, key);

    await expect(resultPromise).rejects.toThrow(
      "Unsupported encryption algorithm"
    );
    expect(mockedDecryptKms).not.toHaveBeenCalled();
  });

  it("Fetch encrypted object with invalid encryption key context", async () => {
    mockedS3Response.Metadata["x-amz-matdesc"] = "null";

    const resultPromise = fetchS3(bucket, key);

    await expect(resultPromise).rejects.toThrow("Invalid key context");
    expect(mockedDecryptKms).not.toHaveBeenCalled();
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

const mockEncryptedS3ObjectData = (
  body: string
): {
  mockedAuthTagBitCountText: string;
  mockedEncryptedBytes: Uint8Array;
  mockedEncryptionAlgorithmName: string;
  mockedEncryptionKey: Uint8Array;
  mockedInitialisationVectorBase64Text: string;
} => {
  const keyBuffer = crypto.randomBytes(32);
  const key = new Uint8Array(keyBuffer);

  const initialisationVector = crypto.randomBytes(123);

  const authTagLength = 12;

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    initialisationVector,
    { authTagLength }
  );

  const encryptedBodyBuffer1 = cipher.update(body);
  const encryptedBodyBuffer2 = cipher.final();
  const authTagBuffer = cipher.getAuthTag();

  const encryptedBuffer = Buffer.concat([
    encryptedBodyBuffer1,
    encryptedBodyBuffer2,
    authTagBuffer,
  ]);

  return {
    mockedAuthTagBitCountText: String(authTagLength * 8),
    mockedEncryptedBytes: new Uint8Array(encryptedBuffer),
    mockedEncryptionAlgorithmName: "AES/GCM/NoPadding",
    mockedEncryptionKey: key,
    mockedInitialisationVectorBase64Text:
      initialisationVector.toString("base64"),
  };
};
