import { Context } from "aws-lambda";
import { handler, TestSupportEvent } from "./handler";
import { getS3Object, listS3Objects } from "./helpers/s3Helper";

jest.mock("./helpers/s3Helper.ts");
const mockedGetS3Object = getS3Object as jest.MockedFunction<
  typeof getS3Object
>;
const mockedListS3Objects = listS3Objects as jest.MockedFunction<
  typeof listS3Objects
>;

let givenContext: Context;
let inputEvent: TestSupportEvent;

beforeEach(() => {
  jest.resetAllMocks();

  givenContext = {
    someContextItem: "some context item",
  } as any;
});

describe("Handler test for integration test support function", () => {
  test("Input event with getS3Object command calls getS3Object function with given parameters", async () => {
    inputEvent = {
      environment: "test-env",
      config: "test-config",
      command: "getS3Object",
      parameters: { some: "parameter" },
    };

    await handler(inputEvent, givenContext);

    expect(mockedGetS3Object).toHaveBeenCalledTimes(1);
    expect(mockedGetS3Object).toHaveBeenCalledWith({ some: "parameter" });
    expect(mockedListS3Objects).not.toHaveBeenCalled();
  });

  test("Input event with listS3Objects command calls listS3Objects function with given parameters", async () => {
    inputEvent = {
      environment: "test-env",
      config: "test-config",
      command: "listS3Objects",
      parameters: { some: "parameter" },
    };

    await handler(inputEvent, givenContext);

    expect(mockedListS3Objects).toHaveBeenCalledTimes(1);
    expect(mockedListS3Objects).toHaveBeenCalledWith({ some: "parameter" });
    expect(mockedGetS3Object).not.toHaveBeenCalled();
  });

  test("Input event with unknown command results in error", async () => {
    inputEvent = {
      environment: "test-env",
      config: "test-config",
      command: "someUnknownCommand",
      parameters: { some: "parameter" },
    };

    await expect(handler(inputEvent, givenContext)).rejects.toThrowError(
      "Function 'someUnknownCommand' is not implemented."
    );
  });
});
