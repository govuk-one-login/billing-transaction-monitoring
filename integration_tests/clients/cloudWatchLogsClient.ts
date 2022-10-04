import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";

const region = "eu-west-2";

const cloudWatchLogsClient = new CloudWatchLogsClient({ region: `${region}` });

export { cloudWatchLogsClient };