import AWS from "aws-sdk";
import { getFromEnv } from "../env";

export const kms = new AWS.KMS({
  region: "eu-west-2",
  endpoint: getFromEnv("LOCAL_ENDPOINT"),
});
