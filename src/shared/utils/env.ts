export type EnvVarName =
  | "ARCHIVE_FOLDER"
  | "BUCKET"
  | "CONFIG_BUCKET"
  | "DATABASE_NAME"
  | "DESTINATION_BUCKET"
  | "DESTINATION_FOLDER"
  | "ENV_NAME"
  | "EVENT_DATA_FOLDER"
  | "LOCAL_ENDPOINT"
  | "NODE_ENV"
  | "OUTPUT_QUEUE_URL"
  | "PARSER_0_VERSION"
  | "PARSER_DEFAULT_VERSION"
  | "PORT"
  | "RAW_INVOICE_BUCKET"
  | "QUERY_RESULTS_BUCKET"
  | "STORAGE_BUCKET"
  | "TEXTRACT_ROLE"
  | "TEXTRACT_SNS_TOPIC";

export const getFromEnv = (varName: EnvVarName): string | undefined =>
  process.env[varName];
