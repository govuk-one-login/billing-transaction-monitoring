import { BusinessLogic } from "../../handler-context";
import {
  backUpEventFile,
  getFileContent,
  getKeys,
  storeBucketingFile,
} from "./s3connect";
import { ConfigCache, Env, MessageBody } from "./types";

export const businessLogic: BusinessLogic<
  MessageBody,
  Env,
  ConfigCache,
  MessageBody
> = async (messageBody, { env, logger }) => {
  const foldersToProcess = getKeysFromDates(
    env.BUCKETING_DAYS_TO_PROCESS,
    messageBody
  );
  for (const folderKey of foldersToProcess) {
    logger.info(`getting files for ${folderKey}`);
    let keys: string[] = await getKeys(
      env.STORAGE_BUCKET,
      folderKey,
      parseInt(env.BUCKETING_FILE_COUNT)
    );
    logger.info(`${keys.length} keys ready to process in ${folderKey}`);
    keys = filterProcessedFileKeys(keys);
    // skip processed files (automated method)
    if (!keys.length) {
      logger.info(`${folderKey} does not require further processing`);
      continue;
    }
    const contents: string[] = [];
    await Promise.all(
      keys.map(async (key) => {
        const content = await getFileContent(env.STORAGE_BUCKET, key);
        // skip processed files (legacy method)
        if (content && !checkForProcessedFileContent(content)) {
          contents.push(content);
          // move event file to backup folder
          await backUpEventFile(env.STORAGE_BUCKET, key);
        }
      })
    );
    logger.info(`finished baccking up files`);
    // do not want to process buckets with only one or no events
    if (contents.length < 2) {
      continue;
    }
    const fileStrings = [];
    while (contents.length > 500) {
      const fileParts = contents.splice(0, 500);
      fileStrings.push(fileParts.join("\n"));
    }
    fileStrings.push(contents.join("\n"));

    logger.info(`creating consolidated files for ${folderKey}`);
    await Promise.all(
      fileStrings.map(async (str) => {
        // create consolidated backup file
        await storeBucketingFile(env.STORAGE_BUCKET, folderKey, str);
      })
    );
    logger.info(`${folderKey} processed successfully`);
  }

  return [messageBody];
};

const getKeysFromDates = (
  bucketingDaysToProcess: string,
  messageBody?: MessageBody
): string[] => {
  let startDate;
  let endDate;
  if (messageBody?.start_date !== undefined) {
    startDate = new Date(messageBody.start_date);
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(bucketingDaysToProcess));
  }
  if (messageBody?.end_date !== undefined) {
    endDate = new Date(messageBody.end_date);
  } else {
    endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
  }
  const keyArray = [];
  /* eslint-disable no-unmodified-loop-condition */
  while (startDate <= endDate) {
    const dateStr = `btm_event_data/${startDate.getFullYear()}/${(
      startDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${startDate.getDate().toString().padStart(2, "0")}`;
    keyArray.push(dateStr);
    startDate.setDate(startDate.getDate() + 1);
  }
  return keyArray;
};

const filterProcessedFileKeys = (fileKeys: string[]): string[] => {
  return fileKeys.filter((fileKey) => {
    const fileKeyParts = fileKey.split("/");
    return !fileKeyParts[fileKeyParts.length - 1].startsWith(
      "bucketing-extract-"
    );
  });
};

const checkForProcessedFileContent = (fileContent: string): boolean => {
  return (fileContent.match(/\n/g) ?? []).length > 0;
};
