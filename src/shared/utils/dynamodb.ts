import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({region: 'eu-west-2', endpoint: process.env.LOCAL_ENDPOINT});
const ddbClient = DynamoDBDocumentClient.from(client);

export async function put(tableName: string, item: Object) {
    console.log("Table:" + tableName);
    console.log("Item:" + JSON.stringify(item));
    let putCommand = new PutCommand({
        TableName: tableName,
        Item: item,
    });

    return ddbClient.send(putCommand).then((data) => {
        console.log(data);
    }).catch(err => {
        console.log(err, err.stack);
        throw(err);
    });
}
