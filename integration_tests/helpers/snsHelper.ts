import { snsClient } from "../clients/snsClient";
import { PublishCommand, PublishInput } from "@aws-sdk/client-sns";

const eventId = new Date().getTime(); //current timestamp to generate unique eventId each time
const snsTopicARN = process.env["SNS_TOPIC_ARN"];

const payload = {
  event_name: "IPV_PASSPORT_CRI_REQUEST_SENT",
  eventId: eventId,
};

const snsParam = {
  Message: JSON.stringify(payload),
  TopicArn: snsTopicARN,
};

async function publishSNS(snsParam: PublishInput) {
  console.log("SNS PARAMETERS:", snsParam);
  const result = await snsClient.send(new PublishCommand(snsParam));
  console.log("***SNS event sent successfully****", result);
  return result;
}

export { eventId, payload, snsParam, publishSNS };