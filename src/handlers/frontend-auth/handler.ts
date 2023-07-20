import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { OAuth2Client } from "google-auth-library";

const region = "eu-west-2";
const accountId = process.env.AWS_ACCOUNT_ID;
const apiId = process.env.AWS_API_ID;
const verb = "GET";
const stage = process.env.ENV_NAME;

const generatePolicy = (
  sub: string,
  effect: "Allow" | "Deny"
): APIGatewayAuthorizerResult => ({
  principalId: sub,
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: `arn:aws:execute-api:${region}:${accountId}:${apiId}/${stage}/${verb}/`,
      },
    ],
  },
});

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const client = new OAuth2Client({
    // keys from secrets manager
  });

  /*
    If the user arrives with a code parameter we assume this
    has been attached by the auth provider and act accordingly,
    denying access at any point that the code turns out not to 
    be valid.
  */
  if (event.queryStringParameters?.code) {
    // TODO: validate the state param
    try {
      // exchange code for tokens
      const { tokens } = await client.getToken(
        event.queryStringParameters.code
      );
      client.setCredentials(tokens);
    } catch (error) {
      // this catches cases where the code cannot be exchanged for a token
      return generatePolicy("None", "Deny");
    }

    if (!client.credentials.access_token) {
      return generatePolicy("None", "Deny");
    }

    // Get a unique identifier for the user to use as our principalId
    try {
      const { sub } = await client.getTokenInfo(
        client.credentials.access_token
      );
      if (!sub) {
        throw new Error("No sub available for access token");
      }
      return generatePolicy(sub, "Allow");
    } catch (error) {
      return generatePolicy("None", "Deny");
    }
  } else if (event.headers?.Authorization) {
    const [, , idToken] =
      event.headers.Authorization.match(
        /^(Bearer\s{0,4})?([._A-Za-z0-9]{1,512})$/
      ) ?? [];

    try {
      const ticket = await client.verifyIdToken({ idToken });
      const sub = ticket.getUserId();
      if (!sub) {
        throw new Error("sub not found on idToken");
      }
      return generatePolicy(sub, "Allow");
    } catch (error) {
      return generatePolicy("None", "Deny");
    }
  }

  return generatePolicy("None", "Deny");
};
