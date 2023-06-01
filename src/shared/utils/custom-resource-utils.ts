import {
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceResponse,
  Context,
} from "aws-lambda";
import https from "https";
import url from "url";
import { logger } from "./logger";

interface ResultArguments {
  context: Context;
  event: CloudFormationCustomResourceEvent;
  reason: string;
  status: CloudFormationCustomResourceResponse["Status"];
}

export const sendCustomResourceResult = async ({
  context,
  event,
  reason,
  status,
}: ResultArguments): Promise<void> =>
  await new Promise((resolve, reject) => {
    const result: CloudFormationCustomResourceResponse = {
      LogicalResourceId: event.LogicalResourceId,
      PhysicalResourceId:
        event.RequestType === "Create"
          ? context.logStreamName
          : event.PhysicalResourceId,
      Reason: reason,
      RequestId: event.RequestId,
      StackId: event.StackId,
      Status: status,
    };

    const body = JSON.stringify(result);

    const { hostname, pathname, search } = new url.URL(event.ResponseURL);

    const options = {
      headers: {
        "content-length": body.length,
      },
      hostname,
      method: "PUT",
      path: `${pathname}${search}`,
      port: 443,
    };

    const request = https.request(options, (response) => {
      response.on("end", resolve);

      response.on("error", (error) => {
        logger.error("Response error", error);
        reject(error);
      });
    });

    request.on("error", (error) => {
      logger.error("Request error", error);
      reject(error);
    });

    request.write(body);
    request.end();
  });
