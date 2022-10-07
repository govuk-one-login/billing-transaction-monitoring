import { snsClient } from "../clients/snsClient";
import { PublishCommand, PublishInput } from "@aws-sdk/client-sns";
import { snsTopicARN } from "../setup/testEnvVar";

const eventId = new Date().getTime(); //current timestamp to generate unique eventId each time

console.log("EVENT_ID:", eventId);

const payload = {
  event_name: "EVENT_1",
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