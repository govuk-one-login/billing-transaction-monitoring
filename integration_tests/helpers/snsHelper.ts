import { snsClient } from "../clients/snsClient";
import { PublishCommand, PublishInput, ListTopicsResponse,Topic,ListTopicsCommand} from "@aws-sdk/client-sns";


const eventId = new Date().getTime(); //current timestamp to generate unique eventId each time

console.log("EVENT_ID:", eventId);

let snsTopicArn: string;
let snsParams: PublishInput

const payload = {
  event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
  eventId: eventId,
};

async function getListOfTopics() {
  const result: ListTopicsResponse = await snsClient.send(new ListTopicsCommand({}));
  const topics: Topic[]= result.Topics ?? [];
  return topics
}


  const getTopicArn = async() => {
  const topics: Topic[] =  await getListOfTopics();
   if (topics.length > 0) {
    const result: Topic = topics.find(d => d.TopicArn?.match("TestTxMATopic")) as Topic;
    console.log(result)
   const arn: string= result.TopicArn?.valueOf() as string;
    return snsTopicArn = arn
  } else {
    throw Error("No topics found");
  }
}

async function snsParameters() {
  snsTopicArn = await getTopicArn()
   const snsParams = {
    Message: JSON.stringify(payload),
    TopicArn: snsTopicArn
  }
  return snsParams
} 


async function publishSNS(snsParams: PublishInput) {
  snsParams = await snsParameters()
    console.log("SNS PARAMETERS:", snsParams);
    const result = await snsClient.send(new PublishCommand(snsParams));
    console.log("***SNS event sent successfully****", result);
    return result;
  }

export { eventId, payload, publishSNS,snsParams };