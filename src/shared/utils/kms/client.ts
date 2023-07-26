import AWS from "aws-sdk";
import { getFromEnv } from "../env";
import { AWS_REGION } from "../../constants";

export const kms = new AWS.KMS({
  region: AWS_REGION,
  endpoint: getFromEnv("LOCAL_ENDPOINT"),
});
