import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { deleteS3, putTextS3, sendResult } from "../../shared/utils";

export const handler = async (
  event: CloudFormationCustomResourceEvent,
  context: Context
): Promise<void> => {
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

    const { Bucket: bucket, Key: key } = s3Object as {
      Bucket: string;
      Key: string;
    };

    if (requestType === "Delete") await deleteS3(bucket, key);
    else {
      if (!("Body" in s3Object)) throw new Error("`S3Object.Body` not found");

      const { Body: body } = s3Object;

      if (typeof body !== "string")
        throw new Error("`S3Object.Body` not a string");

      await putTextS3(bucket, key, body);
    }

    return await sendResult({
      context,
      event,
      reason: `${key} ${requestType.toLowerCase()}d in ${bucket}`,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Handler error:", error);

    return await sendResult({
      context,
      event,
      reason: `See CloudWatch log stream: ${context.logStreamName}`,
      status: "FAILED",
    });
  }
};
