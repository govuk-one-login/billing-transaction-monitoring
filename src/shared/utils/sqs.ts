import { SQSRecord } from "aws-lambda";
import { SQS } from "aws-sdk";

export type RecordSenderArgument = {
  queueUrl: string;
  record: SQSRecord;
  sqs: SQS;
};

export async function sendRecord({ queueUrl, record, sqs }: RecordSenderArgument) {
  console.log("sending record " + JSON.stringify(record));

  const params = {
    MessageBody: JSON.stringify(record),
    QueueUrl: queueUrl,
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, function (err: any, data: any) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject();
      } else {
        console.log(data); // successful response
        resolve("success");
      }
    });
  });
}
