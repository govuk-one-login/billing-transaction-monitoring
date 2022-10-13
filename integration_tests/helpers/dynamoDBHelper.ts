import { dynamoDBClient } from "../clients/dynamoDbClient";
import {
  ScanCommand,
  ScanInput,
  ListTablesCommand,
  ListTablesOutput,
} from "@aws-sdk/client-dynamodb";

async function getTableList() {
  const params = {};
  const response: ListTablesOutput = await dynamoDBClient.send(
    new ListTablesCommand({})
  );
  return response.TableNames ?? [];
}

async function getTableName() {
 const tableList = await getTableList()
 const tableName = tableList.find(item => item.match("di-btm-StorageTable"))
  if(tableName!=null) {
  return tableName;
  }
  else {
    throw Error("No matching table name found")
  }
}

async function scanDB() {
  const dynamoParams: ScanInput = {
    TableName: await getTableName(),
  };
  const data = await dynamoDBClient.send(new ScanCommand(dynamoParams));
  return data;
}

export { scanDB };
