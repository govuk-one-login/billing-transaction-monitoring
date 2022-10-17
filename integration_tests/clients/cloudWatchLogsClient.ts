import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";

const region = "eu-west-2";

const cloudWatchLogsClient = new CloudWatchLogsClient({ region: `${region}`,endpoint: process.env.LOCAL_ENDPOINT});

export { cloudWatchLogsClient };