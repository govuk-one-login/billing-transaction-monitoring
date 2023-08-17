import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { randomUUID } from "crypto";
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
  effect: string | "Allow" | "Deny"; // remove string type once this is tested
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

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<
  | APIGatewayAuthorizerResult
  | { statusCode: number; headers: { Location: string } }
> => {
  // allow unless you've requested you not be allowed by requesting with ?effect=Deny
  if (event.queryStringParameters?.shouldRedirect) {
    return {
      statusCode: 302,
      headers: {
        Location: "https://redirect.example.com/path",
      },
    };
  }
  return generatePolicy({
    apiId: event.requestContext.apiId,
    sub: randomUUID(),
    effect: event.queryStringParameters?.effect ?? "Allow",
  });
};
