import { HandlerCtx } from "../../handler-context";
import { putTextS3 } from "../../shared/utils";
import { store } from "./store";
import { CleanedEventBody } from "./types";

jest.mock("../../shared/utils/s3", () => ({
  putTextS3: jest.fn(),
}));

describe("store", () => {
  it("stores an message in S3 in a directory based on the event timestamp and a file based on the event id", async () => {
    const bucket = "test_bucket";
    const message = {
      timestamp: 1682603719956,
      event_id: "event_001",
      a: 1,
      b: 2,
      c: 3,
    } as unknown as CleanedEventBody;
    const ctx = {
      env: {
        EVENT_DATA_FOLDER: "event_data_folder",
      },
    } as unknown as HandlerCtx<any, any, any>;
    await store(bucket, message, ctx);
    expect(putTextS3).toHaveBeenCalledWith(
      bucket,
      "event_data_folder/2023/04/27/event_001.json",
      '{"timestamp":1682603719956,"event_id":"event_001","a":1,"b":2,"c":3}'
    );
  });
});
