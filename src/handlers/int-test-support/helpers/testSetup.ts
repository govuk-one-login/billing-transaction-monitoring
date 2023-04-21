import { poll } from "./commonHelpers";
import { resourcePrefix } from "./envHelper";
import { deleteS3Objects, listS3Objects } from "./s3Helper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;

export default async function globalSetup(): Promise<void> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  for (let year = 2022; year <= currentYear; year++) {
    const startMonth = year === 2022 ? 1 : 0;
    const endMonth = year === currentYear ? currentMonth : 11;
    for (let month = startMonth; month <= endMonth; month++) {
      const prefix = `btm_event_data/${year}/${(month + 1)
        .toString()
        .padStart(2, "0")}/`;
      console.log(prefix);
      await deleteS3Objects({ bucketName: storageBucket, prefix });
    }
  }

  await poll(
    async () =>
      await listS3Objects({
        bucketName: storageBucket,
        prefix: "btm_event_data",
      }),
    (s3Objects) => s3Objects.Contents === undefined,
    {
      timeout: 60000,
      interval: 10000,
      notCompleteErrorMessage:
        " event_data folder not empty after deleting objects",
    }
  );
  await deleteS3Objects({
    bucketName: storageBucket,
    prefix: "btm_invoice_data",
  });
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
        " invoice_data folder not empty after deleting objects",
    }
  );
}
