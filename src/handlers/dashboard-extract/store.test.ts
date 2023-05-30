import { putTextS3 } from "../../shared/utils";
import { store } from "./store";

jest.mock("../../shared/utils/s3", () => ({
  putTextS3: jest.fn(),
}));

describe("store", () => {
  it("stores a message in S3 to a fixed directory and filename", async () => {
    const bucket = "test_bucket";
    const message = "a message string";

    await store(bucket, message);
    expect(putTextS3).toHaveBeenCalledWith(
      bucket,
      "btm_extract_data/full-extract.json",
      message
    );
  });
});
