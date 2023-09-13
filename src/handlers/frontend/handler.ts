import serverlessExpress from "@vendia/serverless-express";
import { app } from "../../frontend/app";
import { initApp } from "../../frontend/init-app";
import { middleware } from "../../frontend/middleware";
import { ProxyHandler } from "aws-lambda";

initApp(app, middleware);

export const handler: ProxyHandler = async (event, context, callback) => {
  if (event.requestContext?.authorizer?.redirect === "true")
    return {
      statusCode: 302,
      headers: {
        location: event.requestContext?.authorizer?.redirectUrl,
        "set-cookie": event.requestContext?.authorizer?.authCookie,
      },
    };
  const serverlessExpressHandler = serverlessExpress({ app });
  return await serverlessExpressHandler(event, context, callback);
};
