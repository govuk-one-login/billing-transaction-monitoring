import { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent): Promise<void> => {
  // Placeholder lambda function
  console.log(event.Records[0].body);
};
