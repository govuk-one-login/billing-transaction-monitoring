import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { Athena } from "aws-sdk";
import { createOrReplaceView } from "./create-view";
import { deleteView } from "./delete-view";
import { sendResult } from "./send-result";

interface AthenaViewResourceProperty {
  Database: string;
  Name: string;
  Query: string;
  QueryResultBucket: string;
}

export const handler = async (
  event: CloudFormationCustomResourceEvent,
  context: Context
): Promise<void> => {
  try {
    const { RequestType: requestType, ResourceProperties: resourceProperties } =
      event;

    if (!("View" in resourceProperties))
      throw new Error("Property `View` not found");

    const view = resourceProperties.View;

    if (typeof view !== "object")
      throw new Error("Property `View` not an object");

    for (const key of ["Database", "Name", "Query", "QueryResultBucket"]) {
      if (!(key in view)) throw new Error(`\`View.${key}\` not found`);

      if (typeof view[key] !== "string")
        throw new Error(`\`View.${key}\` not a string`);
    }

    const {
      Database: database,
      Name: name,
      Query: query,
      QueryResultBucket: queryResultBucket,
    } = view as AthenaViewResourceProperty;

    const athena = new Athena({ region: "eu-west-2" });

    const baseParams = {
      ResultConfiguration: {
        OutputLocation: queryResultBucket,
      },
      QueryExecutionContext: {
        Database: database,
      },
    };

    if (requestType === "Delete")
      await athena.startQueryExecution({
        ...baseParams,
        QueryString: `DROP VIEW IF EXISTS "${name}"`,
      });
    else
      await athena.startQueryExecution({
        ...baseParams,
        QueryString: `CREATE OR REPLACE VIEW "${name}" AS (${query})`,
      });

    return await sendResult({
      context,
      event,
      reason: `${query} ${requestType.toLowerCase()}d in ${database}`,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Handler error:", error);

    return await sendResult({
      context,
      event,
      reason: `See CloudWatch log stream: ${context.logStreamName}`,
      status: "FAILED",
    });
  }
};
