import { poll } from "./commonHelpers";
import { resourcePrefix } from "./envHelper";
import {
  deleteS3Objects,
  listS3Objects,
  deleteS3ObjectsByPrefixesInBatch,
} from "./s3Helper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export default async function globalSetup(): Promise<void> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // create an array of prefixes to delete
  const prefixesToDelete: string[] = [];

  // Loop through all months from Feb 2022 to current month
  for (let year = 2022; year <= currentYear; year++) {
    const startMonth = year === 2022 ? 2 : 1;
    const endMonth = year === currentYear ? currentMonth : 12;
    for (let month = startMonth; month <= endMonth; month++) {
      const prefix = `btm_event_data/${year}/${month
        .toString()
        .padStart(2, "0")}/`;
      prefixesToDelete.push(prefix);
    }
  }

  // Loop through all prefixes to delete and delete all s3 objects with those prefixes
  for (const prefixToDelete of prefixesToDelete) {
    const result = await deleteS3ObjectsByPrefixesInBatch(
      storageBucket,
      prefixesToDelete,
      1000
    );

    if (result.Errors?.length) {
      console.error("Error deleting objects:", result.Errors);
    } else {
      console.log(`Deleted objects with prefix ${prefixToDelete}`);
    }
  }

  // poll until all objects with the prefixes are deleted
  await poll(
    async () => {
      const s3Objects = await listS3Objects({
        bucketName: storageBucket,
        prefix: `btm_event_data/`,
      });
      const objectKeys = s3Objects.Contents?.map((obj) => obj.Key);
      return prefixesToDelete.every((prefix) => !objectKeys?.includes(prefix));
    },
    (isComplete) => isComplete,
    {
      timeout: 60000,
      interval: 10000,
      notCompleteErrorMessage:
        "prefix could not be deleted because it still contains objects",
    }
  );

  // Delete objects with prefix "btm_invoice_data"
  await deleteS3Objects({
    bucketName: storageBucket,
    prefix: "btm_invoice_data",
  });

  // poll to ensure that the objects with prefix "btm_invoice_data" have been deleted
  await poll(
    async () =>
      await listS3Objects({
        bucketName: storageBucket,
        prefix: "btm_invoice_data",
      }),
    (s3Objects) => s3Objects.Contents === undefined,
    {
      timeout: 60000,
      interval: 10000,
      notCompleteErrorMessage:
        "invoice_data folder could not be deleted because it still contains objects",
    }
  );
}
