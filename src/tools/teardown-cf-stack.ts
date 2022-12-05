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
  S3Client
} from "@aws-sdk/client-s3";
import {
  CloudFormationClient,
  DeleteStackCommand,
  DescribeStackResourcesCommand, StackResource
} from "@aws-sdk/client-cloudformation";
import { AthenaClient, DeleteWorkGroupCommand } from "@aws-sdk/client-athena";

interface AWSError { error: any }

const isAWSError = (object: any): object is AWSError => !!object.error

const isStackResource = (object: any): object is StackResource => (object != null && object.ResourceStatus)

const isNull = (object: any): object is null => object === null;

const wait = async (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const deleteObject = async (bucket: string, objectName: string, version: string): Promise<string | null> => {
  const result = await s3Client.send(new DeleteObjectCommand({Bucket: bucket, Key: objectName, VersionId: version})).catch(err => {return { error: err }});
  // console.log('deleteObject: ', result);
  if (isAWSError(result)) {
    console.log(`error deleting ${objectName} in bucket ${bucket}: ${result.error}`);
    return objectName;
  } else return null;
}

const deleteEmptyBucket = async (resource: StackResource): Promise<StackResource | null> => {
  const result = await s3Client.send(new DeleteBucketCommand({Bucket: resource.PhysicalResourceId})).catch(err => {return { error: err }});
  // console.log('deleteBucket: ', result);
  if (isAWSError(result)) {
    console.log(`error deleting bucket ${resource}: ${result.error}`);
    return resource;
  } else return null;
}

const clearBucket = async (resource: StackResource): Promise<StackResource | null> => {
  const bucket = resource.PhysicalResourceId || '';
  const result = await s3Client.send(new ListObjectVersionsCommand({Bucket: bucket})).catch(err => {return { error: err }});
  // console.log('listObjectVersions: ', result);
  if (isAWSError(result)) {
    console.log("error listing bucket objects: " + result.error);
    return resource;
  }

  const items = [...(result.Versions || []), ...(result.DeleteMarkers || [])];
  const deleteResults = await Promise.all(items.map(item => deleteObject(bucket, item.Key || '', item.VersionId || '')));
  const deleteCount = deleteResults.filter(isNull).length
  console.log(`Bucket: ${bucket}: ${deleteCount} objects deleted, ${deleteResults.length - deleteCount} errors encountered`)

  if (deleteResults.length > deleteCount) return resource;
  if (result.IsTruncated) return await clearBucket(resource);
  return null;
};

const deleteBucket = async (resource: StackResource): Promise<StackResource | null> => {
  await clearBucket(resource);
  return await deleteEmptyBucket(resource);
};

const fetchBucketsInStack = async (stackName: string) => {
  const result = await cfClient.send(new DescribeStackResourcesCommand({StackName: stackName})).catch(err => {return { error: err }});
  // console.log('describeStack: ', result);
  if (isAWSError(result)) {
    console.log(result.error.toString());
    process.exit(-1);
  }

  return (result.StackResources || [])
    .filter((r) => r.ResourceType === 'AWS::S3::Bucket')
    .filter((r) => r.ResourceStatus !== 'DELETE_COMPLETE')
    .map((b) => b.PhysicalResourceId);
}

const destroyStack = async (stackName: string): Promise<StackResource[]> => {
  const deleteResult = await cfClient.send(new DeleteStackCommand({StackName: stackName}));
  // console.log('destroyStack: ', result);
  if (isAWSError(deleteResult)) {
    console.log(deleteResult.error.toString());
    process.exit(-1);
  }

  while (true) {
    await wait(10000);
    const result = await cfClient.send(new DescribeStackResourcesCommand({StackName: stackName})).catch(err => {return {error: err}});
    if (isAWSError(result)) {
      if (result.error.toString().includes(`Stack with id ${stackName} does not exist`)) {
        console.log(`Stack ${stackName} successfully destroyed.`);
        process.exit(0);
      } else {
        console.log(result.error.toString());
        process.exit(-1);
      }
    }
    if (!result.StackResources) {
      console.log('Got empty response from AWS, aborting...')
      process.exit(-1);
    }
    const numberDeleted = result.StackResources.filter(r => r.ResourceStatus === 'DELETE_COMPLETE').length
    const numberLeft = result.StackResources.length - numberDeleted
    const resourcesFailed = result.StackResources.filter(r => r.ResourceStatus === 'DELETE_FAILED')
    console.log(`Resources: total: ${result.StackResources.length}  deleted: ${numberDeleted}  remaining: ${numberLeft}  failed: ${resourcesFailed.length}`);
    if (resourcesFailed.length === numberLeft) {
      console.log(`First run completed, could not delete ${resourcesFailed.length} resource(s).`);
      return resourcesFailed;
    }
  }
}

const deleteAthenaWorkgroup = async (workgroup: StackResource) => {
  const result = await athenaClient.send(new DeleteWorkGroupCommand({RecursiveDeleteOption: true, WorkGroup: workgroup.PhysicalResourceId})).catch(err => {return { error: err }});
  // console.log('deleteWorkGroup: ', result);
  if (isAWSError(result)) {
    console.log(`Deleting the Athena workgroup ${workgroup.PhysicalResourceId} failed. Please delete manually.`)
    console.log(result.error.toString());
    return workgroup;
  }
  return null;
}

const tryToDelete = async (resource: StackResource): Promise<StackResource | null> => {
  switch (resource.ResourceType) {
    case 'AWS::S3::Bucket':
      console.log(`Trying to remove S3 Bucket ${resource.PhysicalResourceId}...`);
      return await deleteBucket(resource);
    case 'Custom::S3Object':
      console.log(`S3-Object ${resource.LogicalResourceId} should already be gone...`);
      return null;
    case 'AWS::Athena::WorkGroup':
      console.log(`Trying to remove Athena workgroup ${resource.PhysicalResourceId}...`);
      return await deleteAthenaWorkgroup(resource);
    default:
      return resource;
  }
}

const awsConfig = { region: 'eu-west-2' };
const s3Client = new S3Client(awsConfig);
const cfClient = new CloudFormationClient(awsConfig);
const athenaClient = new AthenaClient(awsConfig);

const stackSuffix = process.env.ENV_NAME;

if (!stackSuffix) {
  console.log('Please set the environment variable ENV_NAME to specify the stack to delete.');
  process.exit(-1);
}

if (stackSuffix.slice(0,4) !== 'dev-') {
  console.log('This script can only be used to delete dev-* stacks.');
  process.exit(-1);
}

const stackName = `di-btm-${process.env.ENV_NAME}`;

const resourcesFailed = await destroyStack(stackName);

let resourcesRemainingAfterRemediation = (await Promise.all(resourcesFailed.map(r => tryToDelete(r)))).filter(isStackResource);

if(resourcesRemainingAfterRemediation.length === 0) {
  console.log("Retrying to delete stack...")
  resourcesRemainingAfterRemediation = await destroyStack(stackName);
}

if(resourcesRemainingAfterRemediation.length > 0) {
  console.log('Please remove the following resources manually and rerun this command:');
  console.log(resourcesRemainingAfterRemediation.map(r => [r.LogicalResourceId, r.PhysicalResourceId, r.ResourceStatus]));
}
