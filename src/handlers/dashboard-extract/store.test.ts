import { putTextS3 } from "../../shared/utils";
import { store } from "./store";
import { DASHBOARD_EXTRACT_PATH } from "../../shared/constants";

jest.mock("../../shared/utils");

describe("store", () => {
  it("stores a message in S3 to a fixed directory and filename", async () => {
    const bucket = "test_bucket";
    const message = "a message string";

    await store(bucket, message);
    expect(putTextS3).toHaveBeenCalledWith(
      bucket,
      DASHBOARD_EXTRACT_PATH,
      message
    );
  });
});
