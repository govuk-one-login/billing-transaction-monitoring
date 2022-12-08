import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { deleteS3, putTextS3 } from "../../shared/utils";
import { handler } from "./handler";
import { sendResult } from "./send-result";

jest.mock("../../shared/utils");
const mockedDeleteS3 = deleteS3 as jest.MockedFunction<typeof deleteS3>;
const mockedPutTextS3 = putTextS3 as jest.MockedFunction<typeof putTextS3>;

jest.mock("./send-result");
const mockedSendResult = sendResult as jest.MockedFunction<typeof sendResult>;

let givenContext: Context;
const oldConsoleError = console.error;
let validEvent: CloudFormationCustomResourceEvent;

beforeEach(() => {
  jest.resetAllMocks();

  console.error = jest.fn();

  givenContext = {
    logStreamName: "some context log stream name",
  } as any;

  validEvent = {
    RequestType: "some request type",
    ResourceProperties: {
      S3Object: {
        Bucket: "some S3 bucket",
        Key: "some file name",
        Body: '{ "someItemKey": "someItemValue" }',
      },
    },
  } as any;
});

afterAll(() => {
  console.error = oldConsoleError;
});

test("Custom S3 object resource handler with no `S3Object`", async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    ResourceProperties: {},
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with `S3Object` not object", async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    ResourceProperties: {
      S3Object: "some string",
    },
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with no `S3Object.Bucket`", async () => {
  const givenEvent = validEvent;
  delete givenEvent.ResourceProperties.S3Object.Bucket;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with `S3Object.Bucket` not string", async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    ResourceProperties: {
      ...validEvent.ResourceProperties,
      S3Object: {
        ...validEvent.ResourceProperties.S3Object,
        Bucket: 1234,
      },
    },
  };

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with no `S3Object.Key`", async () => {
  const givenEvent: CloudFormationCustomResourceEvent = validEvent;
  delete givenEvent.ResourceProperties.S3Object.Key;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with `S3Object.Key` not string", async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    ResourceProperties: {
      ...validEvent.ResourceProperties,
      S3Object: {
        ...validEvent.ResourceProperties.S3Object,
        Key: 1234,
      },
    },
  };

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test('Custom S3 object resource handler with request type "Delete"', async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Delete",
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedDeleteS3).toHaveBeenCalledTimes(1);
  const {
    ResourceProperties: {
      S3Object: { Bucket: givenBucket, Key: givenKey },
    },
  } = givenEvent;
  expect(mockedDeleteS3).toHaveBeenCalledWith(givenBucket, givenKey);
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with deletion failure", async () => {
  mockedDeleteS3.mockRejectedValue(undefined);

  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Delete",
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
});

test("Custom S3 object resource handler with deletion success", async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Delete",
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining("deleted"),
    status: "SUCCESS",
  });
});

test('Custom S3 object resource handler with request type "Create" and no `S3Object.Body`', async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Create",
  } as any;
  delete givenEvent.ResourceProperties.S3Object.Body;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test('Custom S3 object resource handler with request type "Create" and `S3Object.Body` not string', async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Create",
    ResourceProperties: {
      ...validEvent.ResourceProperties,
      S3Object: {
        ...validEvent.ResourceProperties.S3Object,
        Body: {
          someKey: "some value",
        },
      },
    },
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with creation failure", async () => {
  mockedPutTextS3.mockRejectedValue(undefined);

  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Create",
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
});

test("Custom S3 object resource handler with creation success", async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Create",
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining("created"),
    status: "SUCCESS",
  });
});

test('Custom S3 object resource handler with request type "Update" and no `S3Object.Body`', async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Update",
  } as any;
  delete givenEvent.ResourceProperties.S3Object.Body;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test('Custom S3 object resource handler with request type "Update" and `S3Object.Body` not string', async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Update",
    ResourceProperties: {
      ...validEvent.ResourceProperties,
      S3Object: {
        ...validEvent.ResourceProperties.S3Object,
        Body: {
          someKey: "some value",
        },
      },
    },
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutTextS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with update failure", async () => {
  mockedPutTextS3.mockRejectedValue(undefined);

  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Update",
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
});

test("Custom S3 object resource handler with update success", async () => {
  const givenEvent: CloudFormationCustomResourceEvent = {
    ...validEvent,
    RequestType: "Update",
  } as any;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining("updated"),
    status: "SUCCESS",
  });
});
