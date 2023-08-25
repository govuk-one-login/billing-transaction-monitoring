import serverlessExpress from "@vendia/serverless-express";
import { app } from "../../frontend/app";
import { initApp } from "../../frontend/init-app";
import { middleware } from "../../frontend/middleware";
import { ProxyHandler } from "aws-lambda";
import { GoogleOAuth2ClientAdaptor } from "../frontend-auth/google-oauth-client-adaptor";

initApp(app, middleware);

export const handler: ProxyHandler = async (event, context, callback) => {
  if (!process.env.GOOGLE_CLIENT_ID)
    throw new Error("GOOGLE_CLIENT_ID not configured in this environment");
  if (!process.env.GOOGLE_CLIENT_SECRET)
    throw new Error("GOOGLE_CLIENT_SECRET not configured in this environment");

  const googleOAuth2ClientAdaptor = new GoogleOAuth2ClientAdaptor(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  if (event.requestContext?.authorizer?.redirect)
    return {
      statusCode: 302,
      headers: {
        location: googleOAuth2ClientAdaptor.generateAuthUrl(),
      },
    };
  const iHandler = serverlessExpress({ app });
  return await iHandler(event, context, callback);
};
