import { getFromEnv } from "../env";
import { AWS_REGION } from "../../constants";
import { KMS } from "@aws-sdk/client-kms";

export const kms = new KMS({
  region: AWS_REGION,
  endpoint: getFromEnv("LOCAL_ENDPOINT"),
});
