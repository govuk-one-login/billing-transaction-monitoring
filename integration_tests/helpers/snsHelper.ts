import { snsClient } from "../clients/snsClient";
import {
  PublishCommand,
  PublishInput,
  ListTopicsResponse,
  Topic,
  ListTopicsCommand,
} from "@aws-sdk/client-sns";

let snsTopicArn: string;
let snsParams: PublishInput;

async function getListOfTopics() {
  const result: ListTopicsResponse = await snsClient.send(
    new ListTopicsCommand({})
  );
  const topics: Topic[] = result.Topics ?? [];
  return topics;
}

const getTopicArn = async () => {
  const topics: Topic[] = await getListOfTopics();
  if (topics.length > 0) {
    const result: Topic = topics.find((d) =>
      d.TopicArn?.match("TestTxMATopic")
    ) as Topic;
    console.log(result);
    const arn: string = result.TopicArn?.valueOf() as string;
    return (snsTopicArn = arn);
  } else {
    throw Error("No topics found");
  }
};

async function snsParameters(snsValidEventPayload: any) {
  snsTopicArn = await getTopicArn();
  let snsParams = {
    Message: JSON.stringify(snsValidEventPayload),
    TopicArn: snsTopicArn,
  };
  return snsParams;
}

async function publishSNS(snsValidEventPayload: any) {
  snsParams = await snsParameters(snsValidEventPayload);
  console.log("SNS PARAMETERS:", snsParams);
  const result = await snsClient.send(new PublishCommand(snsParams));
  console.log("***SNS event sent successfully****", result);
  return result;
}

export { publishSNS, snsParams };
