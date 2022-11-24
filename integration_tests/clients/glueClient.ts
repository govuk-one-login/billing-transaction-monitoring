import { GlueClient } from "@aws-sdk/client-glue";

const region = "eu-west-2";

const glueClient = new GlueClient({
  region: `${region}`,
  endpoint: process.env.LOCAL_ENDPOINT,
});

export { glueClient };
