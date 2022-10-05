import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const region = "eu-west-2";

const dynamoDBClient = new DynamoDBClient({ region: `${region}` });

export { dynamoDBClient };