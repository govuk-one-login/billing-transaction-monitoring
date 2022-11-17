import {
  StartExpenseAnalysisCommand,
  TextractClient,
} from "@aws-sdk/client-textract";
import {
  createEvent,
  createEventRecordWithS3data,
} from "../../../test-helpers/SQS";
import { handler } from "./handler";

describe("Extract handler test", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    process.env.TEXT_EXTRACT_ROLE = "Text extract role";
    process.env.SNS_TOPIC = "Textract Raw Invoice Data Topic";
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("Extract handler with valid event record that has S3 data", async () => {
    const S3Record = createEventRecordWithS3data(
      '{"s3":{"s3SchemaVersion":"","configurationId":"","bucket":{"name":"Raw PDF bucket","ownerIdentity":{"principalId":""},"arn":""},"object":{"key":"test.pdf","size":1,"eTag":"","sequencer":""}}}'
    );

    const event = createEvent([S3Record]);

    const textract = new TextractClient({ region: "eu-west-2" });

    textract.send = jest.fn().mockImplementationOnce((command) => {
      expect(command).toBeInstanceOf(StartExpenseAnalysisCommand);
      return { JobId: "Some job ID" };
    });

    const response = await handler(event);
    expect(response.JobId).toEqual("Some job ID");
  });
});
