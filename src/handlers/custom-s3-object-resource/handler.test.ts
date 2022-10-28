import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { deleteS3, putS3 } from "../../shared/utils";
import { handler } from "./handler";
import { sendResult } from "./send-result";

jest.mock("../../shared/utils");
const mockedDeleteS3 = deleteS3 as jest.MockedFunction<typeof deleteS3>;
const mockedPutS3 = putS3 as jest.MockedFunction<typeof putS3>;

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
  } as Context;

  validEvent = {
    RequestType: "some request type",
    ResourceProperties: {
      S3Object: {
        Bucket: "some S3 bucket",
        Key: "some file name",
        Item: {
          someItemKey: "some item value",
        },
      },
    },
  } as unknown as CloudFormationCustomResourceEvent;
});

afterAll(() => {
  console.error = oldConsoleError;
});

test("Custom S3 object resource handler with no `S3Object`", async () => {
  const givenEvent = {
    ...validEvent,
    ResourceProperties: {},
  } as unknown as CloudFormationCustomResourceEvent;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with `S3Object` not object", async () => {
  const givenEvent = {
    ...validEvent,
    ResourceProperties: {
      S3Object: "some string",
    },
  } as unknown as CloudFormationCustomResourceEvent;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutS3).not.toHaveBeenCalled();
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
  expect(mockedPutS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with `S3Object.Bucket` not string", async () => {
  const givenEvent = {
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
  expect(mockedPutS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with no `S3Object.Key`", async () => {
  const givenEvent = validEvent;
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
  expect(mockedPutS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with `S3Object.Key` not string", async () => {
  const givenEvent = {
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
  expect(mockedPutS3).not.toHaveBeenCalled();
});

test('Custom S3 object resource handler with request type "Delete"', async () => {
  const givenEvent = {
    ...validEvent,
    RequestType: "Delete",
  } as CloudFormationCustomResourceEvent;

  await handler(givenEvent, givenContext);

  expect(mockedDeleteS3).toHaveBeenCalledTimes(1);
  const {
    ResourceProperties: {
      S3Object: { Bucket: givenBucket, Key: givenKey },
    },
  } = givenEvent;
  expect(mockedDeleteS3).toHaveBeenCalledWith(givenBucket, givenKey);
  expect(mockedPutS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with deletion failure", async () => {
  mockedDeleteS3.mockRejectedValue(undefined);

  const givenEvent = {
    ...validEvent,
    RequestType: "Delete",
  } as CloudFormationCustomResourceEvent;

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
  const givenEvent = {
    ...validEvent,
    RequestType: "Delete",
  } as CloudFormationCustomResourceEvent;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining("deleted"),
    status: "SUCCESS",
  });
});

test('Custom S3 object resource handler with request type "Create" and no `S3Object.Item`', async () => {
  const givenEvent = {
    ...validEvent,
    RequestType: "Create",
  } as CloudFormationCustomResourceEvent;
  delete givenEvent.ResourceProperties.S3Object.Item;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutS3).not.toHaveBeenCalled();
});

test('Custom S3 object resource handler with request type "Create" and `S3Object.Item` not object', async () => {
  const givenEvent = {
    ...validEvent,
    RequestType: "Create",
    ResourceProperties: {
      ...validEvent.ResourceProperties,
      S3Object: {
        ...validEvent.ResourceProperties.S3Object,
        Item: "some string",
      },
    },
  } as CloudFormationCustomResourceEvent;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with creation failure", async () => {
  mockedPutS3.mockRejectedValue(undefined);

  const givenEvent = {
    ...validEvent,
    RequestType: "Create",
  } as CloudFormationCustomResourceEvent;

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
  const givenEvent = {
    ...validEvent,
    RequestType: "Create",
  } as CloudFormationCustomResourceEvent;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining("created"),
    status: "SUCCESS",
  });
});

test('Custom S3 object resource handler with request type "Update" and no `S3Object.Item`', async () => {
  const givenEvent = {
    ...validEvent,
    RequestType: "Update",
  } as CloudFormationCustomResourceEvent;
  delete givenEvent.ResourceProperties.S3Object.Item;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutS3).not.toHaveBeenCalled();
});

test('Custom S3 object resource handler with request type "Update" and `S3Object.Item` not object', async () => {
  const givenEvent = {
    ...validEvent,
    RequestType: "Update",
    ResourceProperties: {
      ...validEvent.ResourceProperties,
      S3Object: {
        ...validEvent.ResourceProperties.S3Object,
        Item: "some string",
      },
    },
  } as CloudFormationCustomResourceEvent;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining(givenContext.logStreamName),
    status: "FAILED",
  });
  expect(mockedDeleteS3).not.toHaveBeenCalled();
  expect(mockedPutS3).not.toHaveBeenCalled();
});

test("Custom S3 object resource handler with update failure", async () => {
  mockedPutS3.mockRejectedValue(undefined);

  const givenEvent = {
    ...validEvent,
    RequestType: "Update",
  } as CloudFormationCustomResourceEvent;

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
  const givenEvent = {
    ...validEvent,
    RequestType: "Update",
  } as CloudFormationCustomResourceEvent;

  await handler(givenEvent, givenContext);

  expect(mockedSendResult).toHaveBeenCalledTimes(1);
  expect(mockedSendResult).toHaveBeenCalledWith({
    context: givenContext,
    event: givenEvent,
    reason: expect.stringContaining("updated"),
    status: "SUCCESS",
  });
});
