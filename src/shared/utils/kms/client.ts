import { KMS } from "aws-sdk";

export const kms = new KMS({
  region: "eu-west-2",
  endpoint: process.env.LOCAL_ENDPOINT,
});
