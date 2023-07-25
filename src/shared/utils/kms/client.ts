import AWS from "aws-sdk";
import { AWS_REGION } from "../../constants";

export const kms = new AWS.KMS({
  region: AWS_REGION,
  endpoint: process.env.LOCAL_ENDPOINT,
});
