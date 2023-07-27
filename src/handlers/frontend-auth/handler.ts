import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { IOAuth2ClientAdaptor } from "./oauth-client-adaptor";
import { GoogleOAuth2ClientAdaptor } from "./google-oauth-client-adaptor";

const region = "eu-west-2";
const accountId = process.env.AWS_ACCOUNT_ID;
const verb = "GET";
const stage = process.env.ENV_NAME;

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
        Resource: `arn:aws:execute-api:${region}:${accountId}:${apiId}/${stage}/${verb}/`,
      },
    ],
  },
  context,
});

type GetTokenFromAuthCode = ({
  apiId,
  client,
  code,
}: {
  apiId: string;
  client: IOAuth2ClientAdaptor;
  code: string;
}) => Promise<APIGatewayAuthorizerResult>;

const getTokenFromAuthCode: GetTokenFromAuthCode = async ({
  apiId,
  client,
  code,
}) => {
  await client.setCredentialsFromCode(code);
  const { sub } = await client.getDecodedAccessToken();

  if (!sub) {
    throw new Error("No sub value found in decoded access token");
  }

  if (!client.credentials.id_token) {
    throw new Error("No id token given with credentials");
  }

  // TODO: validate the state param (will be in the result of this call under "nonce")
  await validateIdToken({
    apiId,
    client,
    idToken: client.credentials.id_token,
  });

  return generatePolicy({
    apiId,
    sub,
    effect: "Allow",
    context: {
      idToken: client.credentials.id_token,
    },
  });
};

type ValidateIdToken = ({
  apiId,
  client,
  idToken,
}: {
  apiId: string;
  client: IOAuth2ClientAdaptor;
  idToken: string;
}) => Promise<APIGatewayAuthorizerResult>;

const validateIdToken: ValidateIdToken = async ({ apiId, client, idToken }) => {
  const { sub } = await client.verifyIdToken(idToken);
  if (!sub) {
    throw new Error("sub not found on idToken");
  }
  return generatePolicy({ apiId, sub, effect: "Allow", context: { idToken } });
};

const buildHandler =
  (
    OAuth2Client: IOAuth2ClientAdaptor,
    getTokenFromAuthCode: GetTokenFromAuthCode,
    validateIdToken: ValidateIdToken
  ) =>
  async (
    event: APIGatewayRequestAuthorizerEvent
  ): Promise<
    | APIGatewayAuthorizerResult
    | { statusCode: number; headers: { Location: string } }
  > => {
    try {
      if (event.queryStringParameters?.code) {
        return await getTokenFromAuthCode({
          apiId: event.requestContext.apiId,
          client: OAuth2Client,
          code: event.queryStringParameters.code,
        });
      } else if (event.headers?.Authorization) {
        const [, , idToken] =
          event.headers.Authorization.match(
            /^(Bearer\s)?([._A-Za-z0-9]{1,512})$/
          ) ?? [];

        return await validateIdToken({
          apiId: event.requestContext.apiId,
          client: OAuth2Client,
          idToken,
        });
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
  new GoogleOAuth2ClientAdaptor(
    process.env.GOOGLE_CLIENT_ID ?? "",
    process.env.GOOGLE_CLIENT_SECRET ?? ""
  ),
  getTokenFromAuthCode,
  validateIdToken
);
