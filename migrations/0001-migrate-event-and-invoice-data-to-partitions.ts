

import AWS from 'aws-sdk';

async function copyFilesInS3Folder(bucket: string, sourceFolder: string, destinationFolder: string, keyTransform: (key: string) => string): Promise<void> {
  const s3 = new AWS.S3();

  const listObjectsResult = await s3.listObjectsV2({
    Bucket: bucket,
    Prefix: sourceFolder,
  }).promise();

  if (!listObjectsResult.Contents) {
    throw new Error(`No files found on ${bucket} in ${sourceFolder} folder.`)
  }

  for (const object of listObjectsResult.Contents) {
    if (object.Key) {

      const destinationKey = keyTransform(object.Key.slice(sourceFolder.length + 1));
      const copyObjectRequest: AWS.S3.CopyObjectRequest = {
        Bucket: bucket,
        CopySource: `${bucket}/${object.Key}`,
        Key: `${destinationFolder}/${destinationKey}`,
      };
      await s3.copyObject(copyObjectRequest).promise();
    }
  }
}



  await copyFilesInS3Folder('abc', 'def', 'ghi', (key) => {

    formatDate()
  });
