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
  DescribeStackResourcesCommand
} from "@aws-sdk/client-cloudformation";
import { AthenaClient, DeleteWorkGroupCommand } from "@aws-sdk/client-athena";

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

const wait = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const deleteObject = async (bucket, objectName, version) => {
  const result = await s3Client.send(new DeleteObjectCommand({Bucket: bucket, Key: objectName, VersionId: version})).catch(err => {return { Error: err }});
  // console.log('deleteObject: ', result);

  if (result.Error) {
    console.log(`error deleting ${objectName} in bucket ${bucket}: ${result.Error}`);
    return result.Error;
  } else return 0;
}

const deleteEmptyBucket = async (bucket) => {
  const result = await s3Client.send(new DeleteBucketCommand({Bucket: bucket})).catch(err => {return { Error: err }});
  // console.log('deleteBucket: ', result);

  if (result.Error) {
    console.log(`error deleting bucket ${bucket}: ${result.Error}`);
    return result.Error;
  } else return 0;
}

const clearBucket = async (bucket) => {
  const result = await s3Client.send(new ListObjectVersionsCommand({Bucket: bucket})).catch(err => {return { Error: err }});
  // console.log('listObjectVersions: ', result);

  if (result.Error) {
    console.log("error listing bucket objects: " + result.Error);
    return result.Error;
  }

  const items = [...(result.Versions || []), ...(result.DeleteMarkers || [])];
  const deleteResults = await Promise.all(items.map(item => deleteObject(bucket, item.Key, item.VersionId)));
  console.log(`Bucket: ${bucket}: ${deleteResults.filter(r => r === 0).length} objects deleted, ${deleteResults.filter(r => r !== 0).length} errors encountered`)

  if(result.IsTruncated) await clearBucket(bucket);
};

const deleteBucket = async (bucket) => {
  await clearBucket(bucket);
  await deleteEmptyBucket(bucket);
};

const fetchBucketsInStack = async (stackName) => {
  const result = await cfClient.send(new DescribeStackResourcesCommand({StackName: stackName})).catch(err => {return { Error: err }});
  // console.log('describeStack: ', result);
  if (result.Error) {
    console.log(result.Error.toString());
    process.exit(-1);
  }

  return result.StackResources
    .filter((r) => r.ResourceType === 'AWS::S3::Bucket')
    .filter((r) => r.ResourceStatus !== 'DELETE_COMPLETE')
    .map((b) => b.PhysicalResourceId);
}

const deleteAllBucketsInStack = async (stackName) => {
  const buckets = await fetchBucketsInStack(stackName);
  await Promise.all(buckets.map(bucket => deleteBucket(bucket)));
}

const destroyStack = async (stackName) => {
  const result = await cfClient.send(new DeleteStackCommand({StackName: stackName}));
  // console.log('destroyStack: ', result);

  while (true) {
    await wait(10000);
    const result = await cfClient.send(new DescribeStackResourcesCommand({StackName: stackName})).catch(err => {return { Error: err }});
    if (result.Error) {
      if (result.Error.toString().includes(`Stack with id ${stackName} does not exist`)) {
        console.log(`Stack ${stackName} successfully destroyed.`);
        process.exit(0);
      } else {
        console.log(result.Error.toString());
        process.exit(-1);
      }
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

const deleteAthenaWorkgroup = async (workgroup) => {
  const result = await athenaClient.send(new DeleteWorkGroupCommand({RecursiveDeleteOption: true, WorkGroup: workgroup.PhysicalResourceId})).catch(err => {return { Error: err }});
  // console.log('deleteWorkGroup: ', result);
  if (result.Error) {
    console.log(`Deleting the Athena workgroup ${workgroup.PhysicalResourceId} failed. Please delete manually.`)
    console.log(result.Error.toString());
    return workgroup;
  }
  return null;
}

const tryToDelete = async (resource) => {
  if(resource.ResourceType === 'Custom::S3Object') {
    console.log(`S3-Object ${resource.LogicalResourceId} should already be gone...`);
    return null;
  }
  if(resource.ResourceType === 'AWS::Athena::WorkGroup') {
    console.log(`Trying to remove Athena workgroup ${resource.PhysicalResourceId}...`);
    return await deleteAthenaWorkgroup(resource);
  }
  return resource;
}

await deleteAllBucketsInStack(stackName);

const resourcesFailed = await destroyStack(stackName);

let resourcesRemainingAfterRemediation = (await Promise.all(resourcesFailed.map(r => tryToDelete(r)))).filter(x => !!x);

if(resourcesRemainingAfterRemediation.length === 0) {
  console.log("Retrying to delete stack...")
  resourcesRemainingAfterRemediation = await destroyStack(stackName);
}

if(resourcesRemainingAfterRemediation.length > 0) {
  console.log('Please remove the following resources manually and rerun this command:');
  console.log(resourcesRemainingAfterRemediation.map(r => [r.LogicalResourceId, r.PhysicalResourceId, r.ResourceStatus]));
}
