import AWS from "aws-sdk";

// One-off script to migrate existing event data to the new folder structure.
// Invoke using `npm run sam:partition-migrate`.

// Originally the plan was to use the same copy method to migrate the invoice
// data as well, but there were only about ten such files in production, so we
// just copied them by hand.

// TODO This script can go away as part of BTM-486, as the data will have already been migrated by then.

const PREFIX = "di-btm-production";
const DRY_RUN = true;

async function copyFilesInS3Folder(
  dryRun: boolean,
  bucket: string,
  sourceFolder: string,
  keyTransform: (key: string) => string
): Promise<any> {
  const s3 = new AWS.S3();

  let done: boolean | undefined = false;
  let continuationToken;
  const results = [];
  let listObjectsResult;
  let total = 0;

  while (!done) {
    // This will default to only listing 1000 files at most, but returns a continuation token
    // to get the subsequent batches.
    listObjectsResult = await s3
      .listObjectsV2({
        Bucket: bucket,
        Prefix: sourceFolder,
        ContinuationToken: continuationToken,
      })
      .promise();

    if (!listObjectsResult.Contents) {
      throw new Error(`No files found on ${bucket} in ${sourceFolder} folder.`);
    }

    const requests = listObjectsResult.Contents.map((object) => object.Key)
      .filter((key): key is string => !!key)
      .map((key) => {
        const destinationKey = keyTransform(key.slice(sourceFolder.length + 1));
        const copyObjectRequest: AWS.S3.CopyObjectRequest = {
          Bucket: bucket,
          CopySource: `${bucket}/${key}`,
          Key: destinationKey,
        };
        // console.log(`File to copy: ${JSON.stringify(copyObjectRequest)}`);
        return copyObjectRequest;
      });
    console.log(`${requests.length} files to copy.`);
    total += requests.length;

    if (!dryRun) {
      const copyObjectPromises = requests.map(
        async (copyObjectRequest) =>
          await s3.copyObject(copyObjectRequest).promise()
      );

      console.log(`Moving batch of ${copyObjectPromises.length} files...`);
      const batchResults = await Promise.allSettled(copyObjectPromises);
      results.push(...batchResults);
      console.log(`${requests.length} files copied.`);
    }

    continuationToken = listObjectsResult.NextContinuationToken;
    done = !listObjectsResult.IsTruncated;
  }
  console.log(`Total: ${total}`);
  return results;
}

export async function doMigration(): Promise<void> {
  const storageBucket = `${PREFIX}-storage`;

  await copyFilesInS3Folder(
    DRY_RUN,
    storageBucket,
    "btm_transactions",
    (key) => {
      // console.log(`key=${key}`);
      // key for events should be something like folder/2022-07-13/0bb61d94-2dac-45e6-90e7-8f517de30797.json
      const keyParts = key.split("/");
      const yearMonthDay = keyParts[keyParts.length - 2];
      const regexp = /(\d{4})-(\d{2})-(\d{2})/g;
      const matches = regexp.exec(yearMonthDay);
      if (!matches) {
        throw new Error(`Could not parse ${yearMonthDay}`);
      }
      return `btm_event_data/${matches[1]}/${matches[2]}/${matches[3]}/${
        keyParts[keyParts.length - 1]
      }`;
    }
  );
}

await doMigration();
