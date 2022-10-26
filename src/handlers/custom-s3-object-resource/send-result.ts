import {
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceResponse,
  Context,
} from "aws-lambda";
import https from "https";
import url from "url";

type Arguments = {
  context: Context;
  event: CloudFormationCustomResourceEvent;
  reason: string;
  status: CloudFormationCustomResourceResponse["Status"];
};

export const sendResult = ({
  context,
  event,
  reason,
  status,
}: Arguments): Promise<void> =>
  new Promise((resolve, reject) => {
    const result: CloudFormationCustomResourceResponse = {
      LogicalResourceId: event.LogicalResourceId,
      PhysicalResourceId: context.logStreamName,
      Reason: reason,
      RequestId: event.RequestId,
      StackId: event.StackId,
      Status: status,
    };

    const body = JSON.stringify(result);

    const { hostname, path } = url.parse(event.ResponseURL);

    const options = {
      headers: {
        "content-length": body.length,
      },
      hostname,
      method: "PUT",
      path,
      port: 443,
    };

    const request = https.request(options, (response) => {
      response.on("end", resolve);

      response.on("error", (error) => {
        console.error("Response error:", error);
        reject(error);
      });
    });

    request.on("error", (error) => {
      console.error("Request error:", error);
      reject(error);
    });

    request.write(body);
    request.end();
  });
