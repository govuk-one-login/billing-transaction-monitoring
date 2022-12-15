import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { Athena } from "aws-sdk";
import { sendCustomResourceResult } from "../../shared/utils";
import { getAthenaViewResourceData } from "./get-athena-view-resource-data";
import { QueryExecutionValidator } from "./query-execution-validator";

export const handler = async (
  event: CloudFormationCustomResourceEvent,
  context: Context
): Promise<void> => {
  try {
    const { database, name, query, workgroup } =
      getAthenaViewResourceData(event);

    const athena = new Athena({ region: "eu-west-2" });

    const { QueryExecutionId: queryExecutionId } = await athena
      .startQueryExecution({
        QueryExecutionContext: {
          Database: database,
        },
        QueryString:
          event.RequestType === "Delete"
            ? `DROP VIEW IF EXISTS "${name}"`
            : `CREATE OR REPLACE VIEW "${name}" AS (${query})`,
        WorkGroup: workgroup,
      })
      .promise();

    if (queryExecutionId === undefined)
      throw new Error("Failed to start query execution and get ID.");

    const validator = new QueryExecutionValidator(athena);
    await validator.validate(queryExecutionId);

    await sendCustomResourceResult({
      context,
      event,
      reason: `${name} ${event.RequestType.toLowerCase()}d in ${database}`,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Handler error:", error);

    await sendCustomResourceResult({
      context,
      event,
      reason: `See CloudWatch log stream: ${context.logStreamName}`,
      status: "FAILED",
    });
  }
};
