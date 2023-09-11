import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { randomUUID } from "crypto";
import { google } from "googleapis";
import { serialize, parse } from "cookie";
import { Credentials } from "google-auth-library";
const region = "eu-west-2";
const accountId = process.env.AWS_ACCOUNT_ID;
const verb = "GET";

const allowedUsers = [
  "nithya.kannan@digital.cabinet-office.gov.uk",
  "peter.hinterseer@digital.cabinet-office.gov.uk",
  "mark.schnitzius@digital.cabinet-office.gov.uk",
  "gareth.johnson@digital.cabinet-office.gov.uk",
  "mark.potter@digital.cabinet-office.gov.uk",
];

type CookieInfo = {
  email: string;
  tokens: Credentials;
};

const isCookieInfo = (x: any): x is CookieInfo =>
  x.email &&
  typeof x.email === "string" &&
  x.tokens &&
  typeof x.tokens === "object";

const generatePolicy = ({
  apiId,
  sub,
  effect,
  context,
}: {
  apiId: string;
  sub: string;
  effect: "Allow" | "Deny";
  context?: Record<string, string | number | boolean | null | undefined>;
}): APIGatewayAuthorizerResult => ({
  principalId: sub,
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: `arn:aws:execute-api:${region}:${accountId}:${apiId}/web/${verb}/*`,
      },
    ],
  },
  context,
});

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log("🚀 ~ file: handler.ts:41 ~ event:", event);
  console.log("🚀 ~ file: handler.ts:42 ~ event.headers:", event.headers);
  console.log("🚀 ~ file: handler.ts:43 ~ event.methodArn:", event.methodArn);
  console.log(
    "🚀 ~ file: handler.ts:45 ~ event.requestContext:",
    event.requestContext
  );
  console.log("🚀 ~ file: handler.ts:48 ~ process.env:", process.env);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `https://${event.requestContext.domainName}/oauth2/redirect`
  );

  let authenticated = false;
  let shouldRedirect = false;
  let redirectUrl = "";
  let setCookieContent: CookieInfo | undefined;

  if (event.path === "/oauth2/redirect") {
    console.log("Fetching access tokens...");

    let tokens;
    if (event.queryStringParameters?.code) {
      const response = await oauth2Client.getToken(
        event.queryStringParameters.code
      );
      tokens = response.tokens;
    }

    if (!tokens) throw new Error("Unable to fetch access tokens.");

    oauth2Client.setCredentials(tokens);

    console.log("Fetching user info...");

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.v2.me.get();

    if (!userInfo.data.email) throw new Error("Unable to fetch userinfo.");

    setCookieContent = { email: userInfo.data.email, tokens };
    shouldRedirect = true;
    redirectUrl = "/";

    console.log("Gathered data: ", {
      userInfo,
      tokens,
      shouldRedirect,
      redirectUrl,
    });
  }

  if (event.headers?.cookie) {
    const receivedCookie = parse(event.headers.cookie);
    const cookieContent = JSON.parse(receivedCookie.Authentication ?? "{}");

    console.log("Parsed cookie: ", cookieContent);

    if (!isCookieInfo(cookieContent)) throw new Error("Wrong cookie format.");

    oauth2Client.setCredentials(cookieContent.tokens);

    const {
      id_token: idToken,
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: tokenExpiry,
    } = cookieContent.tokens;

    if (
      !accessToken ||
      !idToken ||
      !refreshToken ||
      !cookieContent ||
      !tokenExpiry
    )
      throw new Error("Missing necessary token-information in cookie.");

    if (tokenExpiry < Date.now()) {
      console.log("Access token expired. Refreshing token...");

      const refreshResponse = await oauth2Client.refreshAccessToken();
      setCookieContent = {
        email: cookieContent.email,
        tokens: refreshResponse.credentials,
      };
      shouldRedirect = true;
      redirectUrl = event.path;
    } else {
      const ticket = await oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      console.log("Ticket info: ", ticket.getAttributes());

      const payload = ticket.getPayload();
      if (
        payload?.email &&
        payload.email_verified &&
        allowedUsers.includes(payload.email)
      )
        authenticated = true;
    }
  }

  if (!authenticated && !redirectUrl) {
    shouldRedirect = true;
    redirectUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: "email",
    });
  }

  if (setCookieContent) console.log("Setting cookie:", setCookieContent);

  return generatePolicy({
    apiId: event.requestContext.apiId,
    sub: randomUUID(),
    effect: "Allow",
    context: {
      redirect: shouldRedirect,
      redirectUrl,
      authCookie: setCookieContent
        ? serialize("Authentication", JSON.stringify(setCookieContent), {
            httpOnly: true,
            secure: true,
            path: "/",
          })
        : undefined,
    },
  });
};
