import {
  deleteS3,
  fetchS3,
  listS3Keys,
  moveS3,
  putTextS3,
} from "../../shared/utils";
import {
  backUpEventFile,
  deleteFile,
  getFileContent,
  getKeys,
  moveBucketedFile,
  storeBucketingFile,
} from "./s3connect";

jest.mock("../../shared/utils");

describe("store", () => {
  const bucket = "test_bucket";
  const folderKey = "btm_event_data/2005/02/28/";
  const fileKey = "btm_event_data/2005/02/28/test.json";
  const message = "a message string";

  it("stores a message in S3 to a fixed directory and filename", async () => {
    await storeBucketingFile(bucket, folderKey, message);
    expect(putTextS3).toHaveBeenCalledWith(bucket, expect.any(String), message);
  });

  it("gets the file keys from S3 that belong to the provided bucket and folder", async () => {
    await getKeys(bucket, folderKey);
    expect(listS3Keys).toHaveBeenCalledWith(bucket, folderKey);
  });

  it("returns the file content for the givenfile key and S3 bucket", async () => {
    await getFileContent(bucket, fileKey);
    expect(fetchS3).toHaveBeenCalledWith(bucket, fileKey);
  });

  it("will move the file tree from the original folder to the copy folder", async () => {
    await backUpEventFile(bucket, fileKey);
    expect(moveS3).toHaveBeenCalledWith(
      bucket,
      fileKey,
      bucket,
      `btm_event_data_copy/${fileKey}`
    );
  });

  it("will move the file tree from the copy folder to the original folder", async () => {
    await moveBucketedFile(bucket, fileKey);
    expect(moveS3).toHaveBeenCalledWith(
      bucket,
      `btm_event_data_copy/${fileKey}`,
      bucket,
      fileKey
    );
  });

  it("deletes the file from S£ with the provided bucket and key", async () => {
    await deleteFile(bucket, fileKey);
    expect(deleteS3).toHaveBeenCalledWith(bucket, fileKey);
  });
});
