import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { logger, sendCustomResourceResult } from "../../shared/utils";
import { getAthenaViewResourceData } from "./get-athena-view-resource-data";
import { AthenaQueryExecutor } from "../../shared/utils/athena";
import {
  AthenaClient,
  StartQueryExecutionCommand,
} from "@aws-sdk/client-athena";

export const handler = async (
  event: CloudFormationCustomResourceEvent,
  context: Context
): Promise<void> => {
  try {
    const { database, name, query, workgroup } =
      getAthenaViewResourceData(event);

    const athena = new AthenaClient({ region: "eu-west-2" });

    const { QueryExecutionId: queryExecutionId } = await athena.send(
      new StartQueryExecutionCommand({
        QueryExecutionContext: {
          Database: database,
        },
        QueryString:
          event.RequestType === "Delete"
            ? `DROP VIEW IF EXISTS "${name}"`
            : `CREATE OR REPLACE VIEW "${name}" AS ${query}`,
        WorkGroup: workgroup,
      })
    );

    if (queryExecutionId === undefined)
      throw new Error("Failed to start query execution and get ID.");

    const validator = new AthenaQueryExecutor(athena);
    await validator.validate(queryExecutionId);

    await sendCustomResourceResult({
      context,
      event,
      reason: `${name} ${event.RequestType.toLowerCase()}d in ${database}`,
      status: "SUCCESS",
    });
  } catch (error) {
    logger.error("Handler failure", { error });

    await sendCustomResourceResult({
      context,
      event,
      reason: `See CloudWatch log stream: ${context.logStreamName}`,
      status: "FAILED",
    });
  }
};
