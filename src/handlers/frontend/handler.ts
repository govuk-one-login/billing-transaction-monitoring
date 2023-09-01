import serverlessExpress from "@vendia/serverless-express";
import { app } from "../../frontend/app";
import { initApp } from "../../frontend/init-app";
import { middleware } from "../../frontend/middleware";
import { ProxyHandler } from "aws-lambda";

initApp(app, middleware);

export const handler: ProxyHandler = async (event, context, callback) => {
  console.log(
    "🚀 ~ file: handler.ts:11 ~ consthandler:ProxyHandler= ~ event.requestContext:",
    event.requestContext
  );
  if (event.requestContext?.authorizer?.redirect)
    return {
      statusCode: 302,
      headers: {
        location: "https://google.com", // this will be swapped for a call to generateAuthUrl in the next PR
      },
    };
  const serverlessExpressHandler = serverlessExpress({ app });
  return await serverlessExpressHandler(event, context, callback);
};
