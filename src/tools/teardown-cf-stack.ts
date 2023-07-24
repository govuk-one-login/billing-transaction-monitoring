/**
 * This script tears down a Cloudformation stack which is defined in the env variable ENV_NAME.
 *
 * It empties all the buckets in the stack before calling for stack deletion.
 *
 */

import {
  DeleteBucketCommand,
  DeleteObjectCommand,
  ListObjectVersionsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  CloudFormationClient,
  DeleteStackCommand,
  ListStackResourcesCommand,
  StackResourceSummary,
} from "@aws-sdk/client-cloudformation";
import { AthenaClient, DeleteWorkGroupCommand } from "@aws-sdk/client-athena";
import { getFromEnv } from "../shared/utils";

interface AWSError {
  error: any;
}

const isAWSError = (object: any): object is AWSError =>
  (object as AWSError).error;

const isStackResourceSummary = (object: any): object is StackResourceSummary =>
  object?.ResourceStatus;

const isNull = (object: any): object is null => object === null;

const wait = async (milliseconds: number): Promise<void> => {
  return await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const deleteObject = async (
  bucket: string,
  objectName: string,
  version: string
): Promise<string | null> => {
  const result = await s3Client
    .send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: objectName,
        VersionId: version,
      })
    )
    .catch((err) => {
      return { error: err };
    });
  // console.log('deleteObject: ', result);
  if (isAWSError(result)) {
    console.log(
      `error deleting ${objectName} in bucket ${bucket}: ${
        result.error as string
      }`
    );
    return objectName;
  } else return null;
};

const deleteEmptyBucket = async (
  resource: StackResourceSummary
): Promise<StackResourceSummary | null> => {
  const bucket = resource.PhysicalResourceId ?? "";
  const result = await s3Client
    .send(new DeleteBucketCommand({ Bucket: bucket }))
    .catch((err) => {
      return { error: err };
    });
  // console.log('deleteBucket: ', result);
  if (isAWSError(result)) {
    console.log(`error deleting bucket ${bucket}: ${result.error as string}`);
    return resource;
  } else return null;
};

const clearBucket = async (
  resource: StackResourceSummary
): Promise<StackResourceSummary | null> => {
  const bucket = resource.PhysicalResourceId ?? "";
  const result = await s3Client
    .send(new ListObjectVersionsCommand({ Bucket: bucket }))
    .catch((err) => {
      return { error: err };
    });
  // console.log('listObjectVersions: ', result);
  if (isAWSError(result)) {
    console.log(`error listing bucket objects: ${result.error as string}`);
    return resource;
  }

  const items = [...(result.Versions ?? []), ...(result.DeleteMarkers ?? [])];
  const deleteResults = await Promise.all(
    items.map(
      async (item) =>
        await deleteObject(bucket, item.Key ?? "", item.VersionId ?? "")
    )
  );
  const deleteCount = deleteResults.filter(isNull).length;
  console.log(
    `Bucket: ${bucket}: ${deleteCount} objects deleted, ${
      deleteResults.length - deleteCount
    } errors encountered`
  );

  if (deleteResults.length > deleteCount) return resource;
  if (result.IsTruncated ?? false) return await clearBucket(resource);
  return null;
};

const deleteBucket = async (
  resource: StackResourceSummary
): Promise<StackResourceSummary | null> => {
  await clearBucket(resource);
  return await deleteEmptyBucket(resource);
};

const listAllStackResources = async (
  stackName: string
): Promise<StackResourceSummary[]> => {
  const resources: StackResourceSummary[] = [];
  let nextToken: string | undefined;
  do {
    await wait(10000);
    const result = await cfClient
      .send(
        new ListStackResourcesCommand({
          StackName: stackName,
          NextToken: nextToken,
        })
      )
      .catch((err) => {
        return { error: err };
      });
    if (isAWSError(result)) {
      if (
        (result.error as string)
          .toString()
          .includes(`Stack with id ${stackName} does not exist`)
      ) {
        console.log(`Stack ${stackName} successfully destroyed.`);
        process.exit(0);
      } else {
        console.log(result.error.toString());
        process.exit(-1);
      }
    }
    if (result.StackResourceSummaries === undefined) {
      console.log("Got empty response from AWS, aborting...");
      process.exit(-1);
    }

    resources.push(...result.StackResourceSummaries);
    nextToken = result.NextToken;
  } while (nextToken);
  return resources;
};

const destroyStack = async (
  stackName: string
): Promise<StackResourceSummary[]> => {
  const deleteResult = await cfClient.send(
    new DeleteStackCommand({ StackName: stackName })
  );
  if (isAWSError(deleteResult)) {
    console.log(deleteResult.error.toString());
    process.exit(-1);
  }
  while (true) {
    const resources: StackResourceSummary[] = await listAllStackResources(
      stackName
    );
    const numberDeleted = resources.filter(
      (r) => r.ResourceStatus === "DELETE_COMPLETE"
    ).length;
    const numberLeft = resources.length - numberDeleted;
    const resourcesFailed = resources.filter(
      (r) => r.ResourceStatus === "DELETE_FAILED"
    );

    console.log(
      `Resources: total: ${resources.length}  deleted: ${numberDeleted}  remaining: ${numberLeft}  failed: ${resourcesFailed.length}`
    );

    if (resourcesFailed.length === numberLeft) {
      console.log(
        `First run completed, could not delete ${resourcesFailed.length} resource(s).`
      );
      return resourcesFailed;
    }
  }
};

const deleteAthenaWorkgroup = async (
  workgroup: StackResourceSummary
): Promise<StackResourceSummary | null> => {
  const result = await athenaClient
    .send(
      new DeleteWorkGroupCommand({
        RecursiveDeleteOption: true,
        WorkGroup: workgroup.PhysicalResourceId,
      })
    )
    .catch((err) => {
      return { error: err };
    });
  // console.log('deleteWorkGroup: ', result);
  if (isAWSError(result)) {
    console.log(
      `Deleting the Athena workgroup ${
        workgroup.PhysicalResourceId ?? ""
      } failed. Please delete manually.`
    );
    console.log(result.error.toString());
    return workgroup;
  }
  return null;
};

const tryToDelete = async (
  resource: StackResourceSummary
): Promise<StackResourceSummary | null> => {
  const resourceId = resource.PhysicalResourceId ?? "";
  switch (resource.ResourceType) {
    case "AWS::S3::Bucket":
      console.log(`Trying to remove S3 Bucket ${resourceId}...`);
      return await deleteBucket(resource);
    case "Custom::S3Object":
      console.log(`S3-Object ${resourceId} should already be gone...`);
      return null;
    case "AWS::Athena::WorkGroup":
      console.log(`Trying to remove Athena workgroup ${resourceId}...`);
      return await deleteAthenaWorkgroup(resource);
    default:
      return resource;
  }
};

const awsConfig = { region: "eu-west-2" };
const s3Client = new S3Client(awsConfig);
const cfClient = new CloudFormationClient(awsConfig);
const athenaClient = new AthenaClient(awsConfig);

const stackSuffix = getFromEnv("ENV_NAME");

if (stackSuffix == null || stackSuffix === "") {
  console.log(
    "Please set the environment variable ENV_NAME to specify the stack to delete."
  );
  process.exit(-1);
}

const stackName = `di-btm-${stackSuffix}`;

console.log(
  `!!! Tearing down stack "${stackName}" in 5 seconds. Abort with CTRL-c if that's not correct. !!!`
);
await wait(5000);
console.log(`Starting teardown of stack "${stackName}"...`);

const resourcesFailed = await destroyStack(stackName);
if (resourcesFailed.length > 0) {
  let resourcesRemainingAfterRemediation = (
    await Promise.all(resourcesFailed.map(async (r) => await tryToDelete(r)))
  ).filter(isStackResourceSummary);

  if (resourcesRemainingAfterRemediation.length === 0) {
    console.log("Retrying to delete stack...");
    resourcesRemainingAfterRemediation = await destroyStack(stackName);
  }

  if (resourcesRemainingAfterRemediation.length > 0) {
    console.log(
      "Please remove the following resources manually and rerun this command:"
    );
    console.log(
      resourcesRemainingAfterRemediation.map((r) => [
        r.LogicalResourceId,
        r.PhysicalResourceId,
        r.ResourceStatus,
      ])
    );
  }
}
