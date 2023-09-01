import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { randomUUID } from "crypto";
const region = "eu-west-2";
const accountId = process.env.AWS_ACCOUNT_ID;
const verb = "GET";

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
): Promise<
  | APIGatewayAuthorizerResult
  | { statusCode: number; headers: { Location: string } }
> => {
  return generatePolicy({
    apiId: event.requestContext.apiId,
    sub: randomUUID(),
    // allow unless you've requested you not be allowed by requesting with ?effect=Deny
    effect: event.queryStringParameters?.effect === "deny" ? "Deny" : "Allow",
    context: {
      // set context key redirect to true if query param ?shouldRedirect=true
      redirect: event.queryStringParameters?.shouldRedirect === "true",
    },
  });
};
