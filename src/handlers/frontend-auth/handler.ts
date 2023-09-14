import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from "aws-lambda";
import { randomUUID } from "crypto";
import { parse, serialize } from "cookie";
import { Credentials, OAuth2Client } from "google-auth-library";
import { getConfig, logger } from "../../shared/utils";
import { ConfigElements } from "../../shared/constants";

const region = "eu-west-2";
const accountId = process.env.AWS_ACCOUNT_ID;
const verb = "GET";

const allowedUsers = async (): Promise<string[]> =>
  await getConfig(ConfigElements.allowedUsers);

type CookieContent = {
  email: string;
  tokens: Credentials;
};

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  if (event.stageVariables?.AUTH_ENABLED === "false")
    return allowRequest(event);

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `https://${event.requestContext.domainName}/oauth2/redirect`
  );

  if (event.path === "/oauth2/redirect") {
    let tokens: Credentials | undefined;
    if (event.queryStringParameters?.code) {
      ({ tokens } = await oauth2Client.getToken(
        event.queryStringParameters.code
      ));
    }

    if (!tokens) throw new Error("Unable to fetch tokens.");

    oauth2Client.setCredentials(tokens);

    if (!oauth2Client.credentials.access_token)
      throw new Error("No access token available in credentials");

    const { email } = await oauth2Client.getTokenInfo(
      oauth2Client.credentials.access_token
    );

    if (!email) throw new Error("Email could not be derived from access token");

    return sendRedirect(event, {
      setCookieContent: { email, tokens },
      url: "/",
    });
  }

  const receivedCookieContent = getContentFromCookie(event.headers?.cookie);

  if (!receivedCookieContent)
    return sendRedirectToGoogleAuthUrl(event, oauth2Client);

  oauth2Client.setCredentials(receivedCookieContent.tokens);

  const newTokens = await refreshTokenIfExpired(
    receivedCookieContent?.tokens,
    oauth2Client
  );

  if (newTokens) {
    return sendRedirect(event, {
      setCookieContent: {
        email: receivedCookieContent?.email,
        tokens: newTokens,
      },
    });
  }

  if (
    await isAuthenticateAndAuthorised(
      receivedCookieContent.tokens,
      oauth2Client
    )
  ) {
    return allowRequest(event);
  } else {
    return denyRequest(event);
  }
};

const isCookieInfo = (x: unknown): x is CookieContent =>
  typeof x === "object" &&
  x !== null &&
  "email" in x &&
  typeof x.email === "string" &&
  "tokens" in x &&
  typeof x.tokens === "object" &&
  // Nothing more is assertable about tokens since all fields are optional
  x.tokens !== null;

const generatePolicy = ({
  apiId,
  effect,
  context,
}: {
  apiId: string;
  effect: "Allow" | "Deny";
  context?: Record<string, string | number | boolean | null | undefined>;
}): APIGatewayAuthorizerResult => ({
  principalId: randomUUID(),
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

const sendRedirectToGoogleAuthUrl = (
  event: APIGatewayRequestAuthorizerEvent,
  oauth2Client: OAuth2Client
): APIGatewayAuthorizerResult => {
  const redirectUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: "email",
  });
  return sendRedirect(event, { url: redirectUrl });
};

const sendRedirect = (
  event: APIGatewayRequestAuthorizerEvent,
  options: { setCookieContent?: CookieContent; url?: string }
): APIGatewayAuthorizerResult => {
  if (options.setCookieContent) console.log("Setting cookie");

  return generatePolicy({
    apiId: event.requestContext.apiId,
    effect: "Allow",
    context: {
      redirect: true,
      redirectUrl: options.url ?? event.path,
      authCookie: options.setCookieContent
        ? serialize(
            "Authentication",
            JSON.stringify(options.setCookieContent),
            {
              httpOnly: true,
              secure: true,
              path: "/",
            }
          )
        : undefined,
    },
  });
};

const allowRequest = (
  event: APIGatewayRequestAuthorizerEvent
): APIGatewayAuthorizerResult =>
  generatePolicy({
    apiId: event.requestContext.apiId,
    effect: "Allow",
    context: {},
  });

const denyRequest = (
  event: APIGatewayRequestAuthorizerEvent
): APIGatewayAuthorizerResult =>
  generatePolicy({
    apiId: event.requestContext.apiId,
    effect: "Deny",
    context: {},
  });

const refreshTokenIfExpired = async (
  tokens: Credentials,
  oauth2Client: OAuth2Client
): Promise<Credentials | undefined> => {
  const {
    id_token: idToken,
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: tokenExpiry,
  } = tokens;

  if (!accessToken || !idToken || !refreshToken || !tokenExpiry)
    throw new Error("Missing necessary token-information in cookie.");

  if (tokenExpiry < Date.now()) {
    console.log("Access token expired. Refreshing token...");

    const refreshResponse = await oauth2Client.refreshAccessToken();
    return refreshResponse.credentials;
  }
};

const isAuthenticateAndAuthorised = async (
  tokens: Credentials,
  oauth2Client: OAuth2Client
): Promise<boolean> => {
  if (!tokens.id_token) return false;

  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (payload?.email && payload.email_verified) {
    if ((await allowedUsers()).includes(payload.email)) {
      return true;
    }
  }
  return false;
};

const getContentFromCookie = (
  cookieHeader: string | undefined
): CookieContent | undefined => {
  if (!cookieHeader) return;

  const receivedCookie = parse(cookieHeader);

  let cookieContent;

  try {
    cookieContent = JSON.parse(receivedCookie.Authentication ?? "{}");
  } catch {
    logger.info("Unparsable cookie.");
    return;
  }

  if (!isCookieInfo(cookieContent)) {
    logger.info("Wrong cookie format.");
    return;
  }

  return cookieContent;
};
