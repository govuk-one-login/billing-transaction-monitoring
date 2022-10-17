import { SNSClient } from "@aws-sdk/client-sns";

const region = "eu-west-2";

const snsClient = new SNSClient({ region: `${region}`,endpoint: process.env.LOCAL_ENDPOINT});

export { snsClient };