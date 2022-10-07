import { dynamoDBClient } from "../clients/dynamoDbClient";
import { ScanCommand, ScanInput } from "@aws-sdk/client-dynamodb";
import { dynamoDbTable } from "../setup/testConstants";

const dynamoParams: ScanInput = {
  TableName: dynamoDbTable,
};

async function scanDB() {
  const data = await dynamoDBClient.send(new ScanCommand(dynamoParams));
  return data;
}

export { scanDB, dynamoParams };