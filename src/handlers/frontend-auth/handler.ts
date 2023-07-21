import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { OAuth2Client as GoogleOauth2Client } from "google-auth-library";

// interface Credentials {
//   refresh_token?: string | null;
//   expiry_date?: number | null;
//   access_token?: string | null;
//   id_token?: string | null;
//   scope?: string;
// }

// class OAuth2Client {
//   private readonly _clientId: string
//   private readonly _clientKey: string

//   public readonly credentials: Credentials | undefined

//   constructor(clientId: string, clientKey: string) {
//     this._clientId = clientId
//     this._clientKey = clientKey
//   }

//   // swap the code for a token, set the creds based on the token
//   // public setCredentialsFromCode: (code: string) => Promise<Credentials>
//   public setCredentialsFromCode(code: string): Promise<Credentials> {

//   }

//   // verify the token, return the sub
//   // public verifyIdToken: idToken: string, audience?: string | string[], maxExpiry?: number) => Promise<string>
//   public verifyIdToken(idToken: string, audience?: string | string[], maxExpiry?: number): Promise<string> {

//   }
// }

// TODO this type once you know what methods you need
type OAuth2Client = any;

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
  client: GoogleOauth2Client,
  code: string
): Promise<APIGatewayAuthorizerResult> => {
  // TODO: validate the state param
  try {
    // exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
  } catch (error) {
    // this catches cases where the code cannot be exchanged for a token
    return generatePolicy("None", "Deny");
  }

  if (!client.credentials.access_token) {
    return generatePolicy("None", "Deny");
  }

  if (!client.credentials.id_token) {
    console.error("No id token given with credentials");
    return generatePolicy("None", "Deny");
  }

  // Get a unique identifier for the user to use as our principalId
  try {
    const { sub } = await client.getTokenInfo(client.credentials.access_token);
    if (!sub) {
      throw new Error("No sub value found in decoded access token");
    }

    return generatePolicy(sub, "Allow", {
      idToken: client.credentials.id_token,
    });
  } catch (error) {
    return generatePolicy("None", "Deny");
  }
};

const validateIdToken = async (
  client: GoogleOauth2Client,
  idToken: string
): Promise<APIGatewayAuthorizerResult> => {
  try {
    const ticket = await client.verifyIdToken({ idToken });
    const sub = ticket.getUserId();
    if (!sub) {
      throw new Error("sub not found on idToken");
    }
    return generatePolicy(sub, "Allow", { idToken });
  } catch (error) {
    return generatePolicy("None", "Deny");
  }
};

const buildHandler =
  (
    OAuth2Client: OAuth2Client,
    getTokenFromAuthCode: (
      client: OAuth2Client,
      code: string
    ) => Promise<APIGatewayAuthorizerResult>,
    validateIdToken: (
      client: OAuth2Client,
      idToken: string
    ) => Promise<APIGatewayAuthorizerResult>
  ) =>
  async (
    event: APIGatewayRequestAuthorizerEvent
  ): Promise<APIGatewayAuthorizerResult> => {
    const client = new OAuth2Client({
      // TODO keys from secrets manager
    });

    if (event.queryStringParameters?.code) {
      return await getTokenFromAuthCode(
        client,
        event.queryStringParameters.code
      );
    } else if (event.headers?.Authorization) {
      const [, , idToken] =
        event.headers.Authorization.match(
          /^(Bearer\s)?([._A-Za-z0-9]{1,512})$/
        ) ?? [];

      return await validateIdToken(client, idToken);
    }

    return generatePolicy("None", "Deny");
  };

export const handler = buildHandler(
  GoogleOauth2Client,
  getTokenFromAuthCode,
  validateIdToken
);
