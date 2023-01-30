import { S3Event } from "aws-lambda";
import getCsvConverter from "csvtojson";
import { fetchS3 } from "../../shared/utils";

// TO-DO: Refactor this function out to a helper as it is similar to fetchVendorServiceConfig() in config-utils. Then tests can be copied from the relevant file.

export async function transformCsvToJson(event: S3Event): Promise<any[]> {
  // Each file in the bucket triggers the lamda so even when multiple csvs are added at the same time,
  // the lambda function runs for each one. It is worth re-writing the function to handle multiple
  // records but for now this check will suffice.
  if (event.Records.length > 1) {
    throw Error("Fuction needs re-writing to iterate over multiple records");
  }
  const csvString = await fetchS3(
    event.Records[0].s3.bucket.name,
    event.Records[0].s3.object.key
  );

  return await getCsvConverter().fromString(csvString);
}
