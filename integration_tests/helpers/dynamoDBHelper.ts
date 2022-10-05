import { dynamoDBClient } from "../clients/dynamoDbClient";
import { ScanCommand, ScanInput } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env["TABLENAME"];

const dynamoParams: ScanInput = {
  TableName: TABLE_NAME,
};

async function scanDB() {
  const data = await dynamoDBClient.send(new ScanCommand(dynamoParams));
  return data;
}

export { scanDB, dynamoParams };