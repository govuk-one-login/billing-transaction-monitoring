import { AthenaClient } from "@aws-sdk/client-athena";

const region = "eu-west-2";

const athenaClient = new AthenaClient({ region: `${region}`,endpoint: process.env.LOCAL_ENDPOINT});

export { athenaClient };