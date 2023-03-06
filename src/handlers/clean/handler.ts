import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SqsQueue } from "../../driven/sqs-queue";
import { VendorServiceConfigStore } from "../../driven/vendor-service-config";
import { cleanEventAdapter } from "../../driving/clean-event-adapter";

const sqsQueue = new SqsQueue(
  new SQSClient({
    region: "eu-west-2",
    endpoint: process.env.LOCAL_ENDPOINT,
  })
);

const vendorServiceConfigStore = new VendorServiceConfigStore(
  new S3Client({
    region: "eu-west-2",
    endpoint: process.env.LOCAL_ENDPOINT,
  })
);

export const handler = cleanEventAdapter({
  vendorServiceConfigStore,
  sqsQueue,
});
