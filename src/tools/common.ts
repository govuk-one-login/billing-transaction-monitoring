import {
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectVersionsCommand,
  ObjectIdentifier,
  S3Client,
} from "@aws-sdk/client-s3";

export interface AWSError {
  error: any;
}

interface DeleteResult {
  successfulCount: number;
  errorObjects: ObjectIdentifier[];
}

const isAWSError = (object: any): object is AWSError =>
  (object as AWSError).error;

const deleteObjects = async (
  s3Client: S3Client,
  bucket: string,
  s3objects: ObjectIdentifier[]
): Promise<DeleteResult> => {
  const result = await s3Client
    .send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: s3objects },
      })
    )
    .catch((err) => {
      return { error: err };
    });
  // console.log('deleteObject: ', result);
  if (isAWSError(result)) {
    console.log(
      `Bucket: ${bucket}: Error deleting ${s3objects.length} objects: ${
        result.error as string
      }`
    );
    return { successfulCount: 0, errorObjects: s3objects };
  } else {
    return {
      successfulCount: result.Deleted?.length ?? 0,
      errorObjects:
        result.Errors?.map((err) => ({
          Key: err.Key,
          VersionId: err.VersionId,
        })) ?? [],
    };
  }
};

export const deleteEmptyBucket = async (
  s3Client: S3Client,
  bucket: string
): Promise<string | null> => {
  const result = await s3Client
    .send(new DeleteBucketCommand({ Bucket: bucket }))
    .catch((err) => {
      return { error: err };
    });
  // console.log('deleteBucket: ', result);
  if (isAWSError(result)) {
    console.log(
      `Bucket: ${bucket}: Error during deletion: ${result.error as string}`
    );
    return bucket;
  } else {
    console.log(`Bucket: ${bucket}: Successfully deleted.`);
    return null;
  }
};

export const clearBucket = async (
  s3Client: S3Client,
  bucket: string,
  prevResult: DeleteResult = { successfulCount: 0, errorObjects: [] }
): Promise<DeleteResult> => {
  const result = await s3Client
    .send(new ListObjectVersionsCommand({ Bucket: bucket }))
    .catch((err) => {
      return { error: err };
    });
  // console.log('listObjectVersions: ', result);
  if (isAWSError(result)) {
    console.log(`error listing bucket objects: ${result.error as string}`);
    return prevResult;
  }

  const items = [...(result.Versions ?? []), ...(result.DeleteMarkers ?? [])];

  const deleteResult = await deleteObjects(
    s3Client,
    bucket,
    items.map((item) => ({ Key: item.Key, VersionId: item.VersionId }))
  );

  const resultSoFar: DeleteResult = {
    successfulCount: prevResult.successfulCount + deleteResult.successfulCount,
    errorObjects: [...prevResult.errorObjects, ...deleteResult.errorObjects],
  };

  console.log(
    `Bucket: ${bucket}: ${resultSoFar.successfulCount} objects deleted, ${resultSoFar.errorObjects.length} errors encountered`
  );

  if (result.IsTruncated ?? false)
    return await clearBucket(s3Client, bucket, resultSoFar);
  return resultSoFar;
};
