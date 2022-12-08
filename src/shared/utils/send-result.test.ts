import {
  CloudFormationCustomResourceDeleteEvent,
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceResponse,
  CloudFormationCustomResourceUpdateEvent,
  Context,
} from "aws-lambda";
import { ClientRequest, IncomingMessage } from "http";
import { request } from "https";
import { sendResult } from "../../handlers/custom-s3-object-resource/send-result";

jest.mock("https");
const mockedRequestFunction = request as jest.MockedFunction<typeof request>;

let givenContext: Context;
let givenEvent: CloudFormationCustomResourceEvent;
let givenReason: string;
let givenStatus: CloudFormationCustomResourceResponse["Status"];
let mockedRequestEnd: jest.Mock;
let mockedRequestObject: ClientRequest;
let mockedRequestOn: jest.Mock;
let mockedRequestWrite: jest.Mock;
let mockedResponseObject: IncomingMessage;
let mockedResponseOn: jest.Mock;
const oldConsoleError = console.error;

beforeEach(() => {
  jest.resetAllMocks();

  console.error = jest.fn();

  mockedRequestEnd = jest.fn();
  mockedRequestOn = jest.fn();
  mockedRequestWrite = jest.fn();

  mockedRequestObject = {
    end: mockedRequestEnd,
    on: mockedRequestOn,
    write: mockedRequestWrite,
  } as unknown as ClientRequest;

  mockedRequestFunction.mockReturnValue(mockedRequestObject);

  mockedResponseOn = jest.fn();
  mockedResponseObject = { on: mockedResponseOn } as unknown as IncomingMessage;

  givenContext = {
    logStreamName: "given context log stream name",
  } as unknown as Context;

  givenEvent = {
    LogicalResourceId: "given event logical resource ID",
    RequestId: "given event request ID",
    ResponseURL: "https://given.host.name/given/path",
    StackId: "given event stack ID",
  } as unknown as CloudFormationCustomResourceEvent;

  givenReason = "given reason";

  givenStatus =
    "given status" as CloudFormationCustomResourceResponse["Status"];
});

afterAll(() => {
  console.error = oldConsoleError;
});

test("Result sender with creation event", async () => {
  givenEvent.RequestType = "Create";

  const resultPromise = sendResult({
    context: givenContext,
    event: givenEvent,
    reason: givenReason,
    status: givenStatus,
  });

  const expectedBodyObject = {
    LogicalResourceId: givenEvent.LogicalResourceId,
    PhysicalResourceId: givenContext.logStreamName,
    Reason: givenReason,
    RequestId: givenEvent.RequestId,
    StackId: givenEvent.StackId,
    Status: givenStatus,
  };
  const expectedBody = JSON.stringify(expectedBodyObject);
  const expectedOptions = {
    headers: {
      "content-length": expectedBody.length,
    },
    hostname: "given.host.name",
    method: "PUT",
    path: "/given/path",
    port: 443,
  };

  expect(mockedRequestFunction).toHaveBeenCalledTimes(1);
  expect(mockedRequestFunction).toHaveBeenCalledWith(
    expectedOptions,
    expect.any(Function)
  );

  expect(mockedRequestOn).toHaveBeenCalledTimes(1);
  expect(mockedRequestOn).toHaveBeenCalledWith("error", expect.any(Function));
  expect(mockedRequestWrite).toHaveBeenCalledTimes(1);
  expect(mockedRequestWrite).toHaveBeenCalledWith(expectedBody);
  expect(mockedRequestEnd).toHaveBeenCalledTimes(1);

  const resultRequestCallback = mockedRequestFunction.mock
    .calls[0][1] as Function;
  resultRequestCallback(mockedResponseObject);

  expect(mockedResponseOn).toHaveBeenCalledTimes(2);
  expect(mockedResponseOn).toHaveBeenCalledWith("error", expect.any(Function));
  expect(mockedResponseOn).toHaveBeenCalledWith("end", expect.any(Function));

  const resultResponseEndCall = mockedResponseOn.mock.calls.find(
    ([event]) => event === "end"
  );
  const resultResponseEndCallback = resultResponseEndCall[1];
  resultResponseEndCallback();

  await resultPromise;
});

test("Result sender with update event", async () => {
  givenEvent.RequestType = "Update";

  const resultPromise = sendResult({
    context: givenContext,
    event: givenEvent,
    reason: givenReason,
    status: givenStatus,
  });

  expect(mockedRequestFunction).toHaveBeenCalledTimes(1);
  const expectedBodyObject = {
    LogicalResourceId: givenEvent.LogicalResourceId,
    PhysicalResourceId: (givenEvent as CloudFormationCustomResourceUpdateEvent)
      .PhysicalResourceId,
    Reason: givenReason,
    RequestId: givenEvent.RequestId,
    StackId: givenEvent.StackId,
    Status: givenStatus,
  };
  const expectedBody = JSON.stringify(expectedBodyObject);
  const expectedOptions = {
    headers: {
      "content-length": expectedBody.length,
    },
    hostname: "given.host.name",
    method: "PUT",
    path: "/given/path",
    port: 443,
  };
  expect(mockedRequestFunction).toHaveBeenCalledWith(
    expectedOptions,
    expect.any(Function)
  );
  expect(mockedRequestWrite).toHaveBeenCalledTimes(1);
  expect(mockedRequestWrite).toHaveBeenCalledWith(expectedBody);

  const resultRequestCallback = mockedRequestFunction.mock
    .calls[0][1] as Function;
  resultRequestCallback(mockedResponseObject);

  expect(mockedResponseOn).toHaveBeenCalledWith("end", expect.any(Function));

  const resultResponseEndCall = mockedResponseOn.mock.calls.find(
    ([event]) => event === "end"
  );
  const resultResponseEndCallback = resultResponseEndCall[1];
  resultResponseEndCallback();

  await resultPromise;
});

test("Result sender with deletion event", async () => {
  givenEvent.RequestType = "Delete";

  const resultPromise = sendResult({
    context: givenContext,
    event: givenEvent,
    reason: givenReason,
    status: givenStatus,
  });

  expect(mockedRequestFunction).toHaveBeenCalledTimes(1);
  const expectedBodyObject = {
    LogicalResourceId: givenEvent.LogicalResourceId,
    PhysicalResourceId: (givenEvent as CloudFormationCustomResourceDeleteEvent)
      .PhysicalResourceId,
    Reason: givenReason,
    RequestId: givenEvent.RequestId,
    StackId: givenEvent.StackId,
    Status: givenStatus,
  };
  const expectedBody = JSON.stringify(expectedBodyObject);
  const expectedOptions = {
    headers: {
      "content-length": expectedBody.length,
    },
    hostname: "given.host.name",
    method: "PUT",
    path: "/given/path",
    port: 443,
  };
  expect(mockedRequestFunction).toHaveBeenCalledWith(
    expectedOptions,
    expect.any(Function)
  );
  expect(mockedRequestWrite).toHaveBeenCalledTimes(1);
  expect(mockedRequestWrite).toHaveBeenCalledWith(expectedBody);

  const resultRequestCallback = mockedRequestFunction.mock
    .calls[0][1] as Function;
  resultRequestCallback(mockedResponseObject);

  expect(mockedResponseOn).toHaveBeenCalledWith("end", expect.any(Function));

  const resultResponseEndCall = mockedResponseOn.mock.calls.find(
    ([event]) => event === "end"
  );
  const resultResponseEndCallback = resultResponseEndCall[1];
  resultResponseEndCallback();

  await resultPromise;
});

test("Result sender with request error", async () => {
  const resultPromise = sendResult({
    context: givenContext,
    event: givenEvent,
    reason: givenReason,
    status: givenStatus,
  });

  const resultRequestCallback = mockedRequestFunction.mock
    .calls[0][1] as Function;
  resultRequestCallback(mockedResponseObject);

  expect(mockedResponseOn).toHaveBeenCalledTimes(2);
  expect(mockedResponseOn).toHaveBeenCalledWith("end", expect.any(Function));
  expect(mockedResponseOn).toHaveBeenCalledWith("error", expect.any(Function));

  const resultRequestErrorCallback = mockedRequestOn.mock.calls[0][1];
  resultRequestErrorCallback(new Error("some error"));

  let resultError;
  try {
    await resultPromise;
  } catch (error) {
    resultError = error;
  }

  expect(resultError).toBeInstanceOf(Error);
});

test("Result sender with response error", async () => {
  const resultPromise = sendResult({
    context: givenContext,
    event: givenEvent,
    reason: givenReason,
    status: givenStatus,
  });

  const resultRequestCallback = mockedRequestFunction.mock
    .calls[0][1] as Function;
  resultRequestCallback(mockedResponseObject);

  const resultResponseErrorCall = mockedResponseOn.mock.calls.find(
    ([event]) => event === "error"
  );
  const resultResponseErrorCallback = resultResponseErrorCall[1];
  resultResponseErrorCallback(new Error("some error"));

  let resultError;
  try {
    await resultPromise;
  } catch (error) {
    resultError = error;
  }

  expect(resultError).toBeInstanceOf(Error);
});

test("Result sender with no error", async () => {
  const resultPromise = sendResult({
    context: givenContext,
    event: givenEvent,
    reason: givenReason,
    status: givenStatus,
  });

  const resultRequestCallback = mockedRequestFunction.mock
    .calls[0][1] as Function;
  resultRequestCallback(mockedResponseObject);

  const resultResponseEndCall = mockedResponseOn.mock.calls.find(
    ([event]) => event === "end"
  );
  const resultResponseEndCallback = resultResponseEndCall[1];
  resultResponseEndCallback();

  let resultError;
  try {
    await resultPromise;
  } catch (error) {
    resultError = error;
  }

  expect(resultError).toBeUndefined();
});
