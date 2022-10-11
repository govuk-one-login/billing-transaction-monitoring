import {mockClient} from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import {put} from "./dynamodb";

const dynamoDBDocumentMock = mockClient(DynamoDBDocumentClient);

const tableName = 'A Table';
const item = { id: 1234 };

test('log message when error happens', async () => {
    dynamoDBDocumentMock.on(PutCommand).rejects('An error');

    await expect(put(tableName, item)).rejects.toMatchObject({message: 'An error'});
    expect(dynamoDBDocumentMock.calls()[0].firstArg.input).toEqual({
        TableName: tableName,
        Item: item,
    });
});

test('Handle successful put', async () => {
    dynamoDBDocumentMock.on(PutCommand).resolves({});

    await put(tableName, item);

    expect(dynamoDBDocumentMock.calls()[0].firstArg.input).toEqual({
        TableName: tableName,
        Item: item,
    });
});
