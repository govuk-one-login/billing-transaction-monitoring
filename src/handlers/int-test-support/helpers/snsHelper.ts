import {
  PublishCommand,
  PublishCommandOutput,
  PublishInput,
} from "@aws-sdk/client-sns";
import { resourcePrefix, runViaLambda } from "./envHelper";
import { snsClient } from "../clients";
import { sendLambdaCommand } from "./lambdaHelper";

let snsParams: PublishInput;

const snsParameters = async (
  snsValidEventPayload: any
): Promise<{
  Message: string;
  TopicArn: string;
}> => ({
  Message: JSON.stringify(snsValidEventPayload),
  TopicArn: `arn:aws:sns:eu-west-2:582874090139:${resourcePrefix()}-test-TxMA-topic`,
});

const publishSNS = async (payload: any): Promise<PublishCommandOutput> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "publishSNS",
      payload
    )) as unknown as PublishCommandOutput;
  snsParams = await snsParameters(payload);
  console.log("SNS PARAMETERS:", snsParams);
  const result = await snsClient.send(new PublishCommand(snsParams));
  console.log("***SNS event sent successfully****", result);
  return result;
};

export { publishSNS, snsParams };
