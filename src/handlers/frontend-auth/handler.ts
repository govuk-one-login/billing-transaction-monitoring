import { APIGatewaySimpleAuthorizerResult } from "aws-lambda";

export const handler = async (): Promise<APIGatewaySimpleAuthorizerResult> => ({
  isAuthorized: true,
});
