import {
  fetchS3,
  listS3Keys,
  putTextS3,
  moveS3,
  deleteS3,
} from "../../shared/utils";

export const storeBucketingFile = async (
  bucket: string,
  key: string,
  fileStr: string
): Promise<void> => {
  return await putTextS3(
    bucket,
    `${key}/bucketing-extract-${Date.now()}.json`,
    fileStr
  );
};

export const getKeys = async (
  bucket: string,
  key: string,
  maxKeys?: number
): Promise<string[]> => {
  return await listS3Keys(bucket, key, maxKeys);
};

export const getFileContent = async (
  bucket: string,
  key: string
): Promise<string> => {
  return await fetchS3(bucket, key);
};

export const backUpEventFile = async (
  bucket: string,
  sourceKey: string
): Promise<void> => {
  return await moveS3(
    bucket,
    sourceKey,
    bucket,
    `btm_event_data_copy/${sourceKey}`
  );
};

export const moveBucketedFile = async (
  bucket: string,
  sourceKey: string
): Promise<void> => {
  return await moveS3(
    bucket,
    `btm_event_data_copy/${sourceKey}`,
    bucket,
    sourceKey
  );
};

export const deleteFile = async (
  bucket: string,
  key: string
): Promise<void> => {
  return await deleteS3(bucket, key);
};
