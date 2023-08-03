import { sqsClient } from "../clients";
import {
  SendMessageCommand,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";
import { AWS_REGION } from "../../../shared/constants";
import { logger } from "../../../shared/utils";
import { accountId, resourcePrefix, runViaLambda } from "./envHelper";
import { IntTestHelpers } from "../types";
import { sendLambdaCommand } from "./lambdaHelper";

export enum Queue {
  FILTER = "FILTER",
  CLEAN = "CLEAN",
  STORAGE = "STORAGE",
}
export type SendSQSMessageParams = {
  queue: Queue;
  message: string;
};

export const sendMessageToQueue = async (
  params: SendSQSMessageParams
): Promise<boolean> => {
  if (runViaLambda()) {
    return (await sendLambdaCommand(
      IntTestHelpers.sendMessageToQueue,
      params
    )) as unknown as boolean;
  }
  const sendMessageParams: SendMessageCommandInput = {
    MessageBody: params.message,
    QueueUrl: `https://sqs.${AWS_REGION}.amazonaws.com/${await accountId()}/${queueName(
      params.queue
    )}`,
  };

  const data = await sqsClient.send(new SendMessageCommand(sendMessageParams));
  if (data?.MessageId) {
    logger.debug("Success, message sent. MessageID:", data.MessageId);
    return true;
  } else {
    const message = "Error sending message to SQS.";
    logger.error(message);
    throw new Error(message);
  }
};

const queueName = (queue: Queue): string => {
  switch (queue) {
    case Queue.FILTER:
      return `${resourcePrefix()}-filter-queue`;
    case Queue.CLEAN:
      return `${resourcePrefix()}-clean-queue`;
    case Queue.STORAGE:
      return `${resourcePrefix()}-storage-queue`;
  }
};
