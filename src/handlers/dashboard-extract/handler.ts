import AWS from "aws-sdk";
import { Athena } from "aws-sdk/clients/all";
import { QueryExecutionState } from "aws-sdk/clients/athena";

import { Response } from "../../shared/types";

export const handler = async (): Promise<Response> => {
  const response: Response = {
    batchItemFailures: [],
  };

  const fetchDataSql = `SELECT * FROM "${process.env.DATABASE_NAME}".btm_billing_and_transactions_curated`;
  const results: QueryResults = (await query(fetchDataSql)) as QueryResults;
  await writeExtractToS3(results);

  return response;
};

const athena: Athena = new AWS.Athena();

export async function query(sql: string): Promise<object> {
  const params = {
    QueryString: sql,
    ResultConfiguration: {
      OutputLocation: process.env.RESULTS_BUCKET,
    },
  };

  const queryExecution = await athena.startQueryExecution(params).promise();
  const queryExecutionId = queryExecution.QueryExecutionId;

  if (queryExecutionId === null || queryExecutionId === undefined) {
    throw new Error("Failed to start execution");
  }

  let state: QueryExecutionState = "QUEUED";
  let reason: string | undefined;
  while (state === "RUNNING" || state === "QUEUED") {
    const data = await athena
      .getQueryExecution({ QueryExecutionId: queryExecutionId })
      .promise();
    state = data.QueryExecution?.Status?.State ?? "Unknown";
    reason = data.QueryExecution?.Status?.StateChangeReason;
  }

  if (state !== "SUCCEEDED") {
    throw new Error(`Query execution failed: ${reason}`);
  }

  return await athena
    .getQueryResults({ QueryExecutionId: queryExecutionId })
    .promise();
}

interface Cell {
  VarCharValue: string;
}

interface Row {
  Data: Cell[];
}

interface ResultSet {
  Rows: Row[];
}

interface QueryResults {
  ResultSet: ResultSet;
  UpdateCount: number;
}

async function writeExtractToS3(results: QueryResults): Promise<void> {
  const body = getExtractData(results);

  const s3Client = new AWS.S3({
    region: "eu-west-2",
  });

  // We use multipart upload here because, surprisingly, s3Client.putObject
  // fails to upload the file but also doesn't throw an error (see
  // https://stackoverflow.com/questions/54874350/silent-failure-of-s3-putobject).
  // As there is a 5MB limit on the part size in a multipart upload, we can
  // get away with just uploading it as a single part though.

  const { UploadId } = await s3Client
    .createMultipartUpload({
      Bucket: process.env.STORAGE_BUCKET as string,
      Key: "btm_extract_data/full-extract.json",
    })
    .promise();

  if (UploadId === undefined) {
    throw new Error("Upload id undefined");
  }

  // upload parts of the file
  const { ETag } = await s3Client
    .uploadPart({
      Bucket: process.env.STORAGE_BUCKET as string,
      Key: "btm_extract_data/full-extract.json",
      PartNumber: 1,
      UploadId,
      Body: body,
    })
    .promise();

  // complete the multipart upload
  await s3Client
    .completeMultipartUpload({
      Bucket: process.env.STORAGE_BUCKET as string,
      Key: "btm_extract_data/full-extract.json",
      MultipartUpload: {
        Parts: [{ ETag, PartNumber: 1 }],
      },
      UploadId,
    })
    .promise();
}

function getExtractData(results: QueryResults): string {
  // The column headers are returned as the 0th element of result set.
  // For each of the remaining rows, we need to generate key/value pairs
  // where the keys are the column header names.
  const rows = results.ResultSet.Rows;
  const columnHeaders = rows[0].Data;
  const lines = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].Data;
    const outputRow = {} as any;
    for (let j = 0; j < columnHeaders.length; j++) {
      outputRow[columnHeaders[j].VarCharValue] = row[j].VarCharValue;
    }
    lines.push(JSON.stringify(outputRow));
  }

  return lines.join("\n");
}
