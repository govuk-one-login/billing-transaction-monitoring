import AWS from "aws-sdk";

export const kms = new AWS.KMS({
  region: "eu-west-2",
  endpoint: process.env.LOCAL_ENDPOINT,
});
