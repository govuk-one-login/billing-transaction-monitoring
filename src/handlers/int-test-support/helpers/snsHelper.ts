import {
  ListTopicsCommand,
  PublishBatchCommand,
  PublishCommand,
  PublishCommandOutput,
  PublishInput,
} from "@aws-sdk/client-sns";
import { resourcePrefix, runViaLambda } from "./envHelper";
import { snsClient } from "../clients";
import { sendLambdaCommand } from "./lambdaHelper";
import NodeCache from "node-cache";

let snsParams: PublishInput;

const inMemCache = new NodeCache();
const testTopicCacheKey = "testTopic";

const testTopic = async (): Promise<string> => {
  if (inMemCache.has(testTopicCacheKey))
    return (await inMemCache.get(testTopicCacheKey)) ?? "";
  const listOfTopics = await snsClient.send(new ListTopicsCommand({}));
  const testTopic = listOfTopics.Topics?.map((topic) => topic.TopicArn).find(
    (arn) => arn?.includes(`${resourcePrefix()}-test-TxMA-topic`)
  );
  inMemCache.set(testTopicCacheKey, testTopic);
  return testTopic ?? "";
};

const snsParameters = async (
  snsValidEventPayload: any
): Promise<{
  Message: string;
  TopicArn: string;
}> => ({
  Message: JSON.stringify(snsValidEventPayload),
  TopicArn: await testTopic(),
});

export const publishToTestTopic = async (
  payload: any
): Promise<PublishCommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "publishToTestTopic",
      payload
    )) as unknown as PublishCommandOutput;
  snsParams = await snsParameters(payload);
  const result = await snsClient.send(new PublishCommand(snsParams));
  return result;
};

export const batchPublishToTestTopic = async (
  payloads: any[]
): Promise<PublishCommandOutput> => {
  const TopicArn = await testTopic();

  const result = await snsClient.send(
    new PublishBatchCommand({ TopicArn, PublishBatchRequestEntries: payloads })
  );
  return result;
};
