import { S3Event } from "aws-lambda";
import getCsvConverter from "csvtojson";
import { fetchS3 } from "../../shared/utils";

// Unsure how to test this function or indeed if it even needs testing given that it basically just using S3 and the csvtojson library. Feedback/Help welcome!

export async function transformCsvToJson(event: S3Event): Promise<any[]> {
  const csvString = await fetchS3(
    event.Records[0].s3.bucket.name,
    event.Records[0].s3.object.key
  );

  if (csvString === undefined) throw Error("No csv found");
  return await getCsvConverter().fromString(csvString);
}
