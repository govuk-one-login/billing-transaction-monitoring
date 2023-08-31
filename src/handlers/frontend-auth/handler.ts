import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";
import { randomUUID } from "crypto";

const generatePolicy = ({
  sub,
  effect,
  resource,
  context,
}: {
  sub: string;
  effect: "Allow" | "Deny";
  context?: Record<string, string | number | boolean | null | undefined>;
  resource: string;
}): APIGatewayAuthorizerResult => ({
  principalId: sub,
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  },
  context,
});

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<
  | APIGatewayAuthorizerResult
  | { statusCode: number; headers: { Location: string } }
> => {
  const [effect, redirect] = ((): ["Allow" | "Deny", boolean] => {
    switch (event.authorizationToken) {
      case "allow":
        return ["Allow", false];
      case "deny":
        return ["Deny", true];
      case "unauthorized":
        return ["Deny", false];
      default:
        return ["Deny", true];
    }
  })();
  return generatePolicy({
    resource: event.methodArn,
    sub: randomUUID(),
    effect,
    context: {
      redirect,
    },
  });
};
