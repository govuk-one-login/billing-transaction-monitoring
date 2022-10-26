import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { deleteS3, putS3 } from "../../shared/utils";
import { sendResult } from "./send-result";

export const handler = async (
  event: CloudFormationCustomResourceEvent,
  context: Context
) => {
  try {
    const { RequestType: requestType, ResourceProperties: resourceProperties } =
      event;

    if (!("S3Object" in resourceProperties))
      throw new Error("Property `S3Object` not found");

    const s3Object = resourceProperties.S3Object;

    if (typeof s3Object !== "object")
      throw new Error("Property `S3Object` not an object");

    for (const key of ["Bucket", "Key"]) {
      if (!(key in s3Object)) throw new Error(`\`S3Object.${key}\` not found`);

      if (typeof s3Object[key] !== "string")
        throw new Error(`\`S3Object.${key}\` not a string`);
    }

    const { Bucket: bucket, Key: key } = s3Object;

    if (requestType === "Delete") await deleteS3(bucket, key);
    else {
      if (!("Item" in s3Object)) throw new Error("`S3Object.Item` not found");

      const { Item: item } = s3Object;

      if (typeof item !== "object")
        throw new Error("`S3Object.Item` not an object");

      await putS3(bucket, key, item);
    }

    return sendResult({
      context,
      event,
      reason: `${key} ${requestType.toLowerCase()}d in ${bucket}`,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Handler error:", error);

    return sendResult({
      context,
      event,
      reason: `See CloudWatch log stream: ${context.logStreamName}`,
      status: "FAILED",
    });
  }
};
