import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { IOAuth2ClientAdaptor } from "./oauth-client-adaptor";
import { GoogleOAuth2ClientAdaptor } from "./google-oauth-client-adaptor";

const region = "eu-west-2";
const accountId = process.env.AWS_ACCOUNT_ID;
const apiId = process.env.AWS_API_ID;
const verb = "GET";
const stage = process.env.ENV_NAME;

const generatePolicy = (
  sub: string,
  effect: "Allow" | "Deny",
  context?: Record<string, string | number | boolean | null | undefined>
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
  context,
});

const getTokenFromAuthCode = async (
  client: IOAuth2ClientAdaptor,
  code: string
): Promise<APIGatewayAuthorizerResult> => {
  await client.setCredentialsFromCode(code);
  const { sub } = await client.getDecodedAccessToken();

  if (!sub) {
    throw new Error("No sub value found in decoded access token");
  }

  if (!client.credentials.id_token) {
    throw new Error("No id token given with credentials");
  }

  // TODO: validate the state param (will be in the result of this call under "nonce")
  await validateIdToken(client, client.credentials.id_token);

  return generatePolicy(sub, "Allow", {
    idToken: client.credentials.id_token,
  });
};

const validateIdToken = async (
  client: IOAuth2ClientAdaptor,
  idToken: string
): Promise<APIGatewayAuthorizerResult> => {
  const { sub } = await client.verifyIdToken(idToken);
  if (!sub) {
    throw new Error("sub not found on idToken");
  }
  return generatePolicy(sub, "Allow", { idToken });
};

const buildHandler =
  (
    OAuth2Client: IOAuth2ClientAdaptor,
    getTokenFromAuthCode: (
      client: IOAuth2ClientAdaptor,
      code: string
    ) => Promise<APIGatewayAuthorizerResult>,
    validateIdToken: (
      client: IOAuth2ClientAdaptor,
      idToken: string
    ) => Promise<APIGatewayAuthorizerResult>
  ) =>
  async (
    event: APIGatewayRequestAuthorizerEvent
  ): Promise<
    | APIGatewayAuthorizerResult
    | { statusCode: number; headers: { Location: string } }
  > => {
    try {
      if (event.queryStringParameters?.code) {
        return await getTokenFromAuthCode(
          OAuth2Client,
          event.queryStringParameters.code
        );
      } else if (event.headers?.Authorization) {
        const [, , idToken] =
          event.headers.Authorization.match(
            /^(Bearer\s)?([._A-Za-z0-9]{1,512})$/
          ) ?? [];

        return await validateIdToken(OAuth2Client, idToken);
      }
    } catch (error) {
      // return generatePolicy("None", "Deny");
      return {
        statusCode: 302,
        headers: {
          Location: "https://redirect.example.com/path",
        },
      };
    }
    // I'd like to find a way to invert this fallthrough case
    // return generatePolicy("None", "Deny");
    return {
      statusCode: 302,
      headers: {
        Location: "https://redirect.example.com/path",
      },
    };
  };

export const handler = buildHandler(
  // TODO add keys from secrets manager
  new GoogleOAuth2ClientAdaptor("<CLIENT_ID>", "<CLIENT_SECRET>"),
  getTokenFromAuthCode,
  validateIdToken
);
