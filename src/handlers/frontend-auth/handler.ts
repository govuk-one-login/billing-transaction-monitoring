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
  context: { ...context, redirect: effect === "Deny" },
});

const buildHandler =
  (oAuth2Client: IOAuth2ClientAdaptor) =>
  async (
    event: APIGatewayRequestAuthorizerEvent
  ): Promise<APIGatewayAuthorizerResult> => {
    const { apiId } = event.requestContext;
    try {
      // A user arrives with an idToken
      // if the token is valid they're already logged in
      if (event.headers?.Authorization) {
        const [, , idToken] =
          event.headers.Authorization.match(
            /^(Bearer\s)?([._A-Za-z0-9]{1,512})$/
          ) ?? [];

        const { sub } = await oAuth2Client.verifyIdToken(idToken);
        if (!sub) {
          throw new Error("sub not found on idToken");
        }
        return generatePolicy({
          apiId,
          sub,
          effect: "Allow",
          context: { idToken },
        });
      }
      // A user arrives with a code param
      // The code can be exchanged for an idToken
      if (event.queryStringParameters?.code) {
        await oAuth2Client.setCredentialsFromCode(
          event.queryStringParameters.code
        );
        const { sub } = await oAuth2Client.getDecodedAccessToken();

        if (!sub) {
          throw new Error("No sub value found in decoded access token");
        }

        if (!oAuth2Client.credentials.id_token) {
          throw new Error("No id token given with credentials");
        }

        // TODO: validate the state param (will be in the result of this call under "nonce")
        await oAuth2Client.verifyIdToken(oAuth2Client.credentials.id_token);

        return generatePolicy({
          apiId,
          sub,
          effect: "Allow",
          context: {
            idToken: oAuth2Client.credentials.id_token,
          },
        });
      }
    } catch (error) {
      return generatePolicy({ apiId, sub: "None", effect: "Deny" });
    }

    return generatePolicy({ apiId, sub: "None", effect: "Deny" });
  };

export const handler = buildHandler(
  new GoogleOAuth2ClientAdaptor(
    process.env.GOOGLE_CLIENT_ID ?? "",
    process.env.GOOGLE_CLIENT_SECRET ?? ""
  )
);
