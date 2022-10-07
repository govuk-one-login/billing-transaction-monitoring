const filter_function_log_groupName = process.env[
  "FILTER_FUNCTION_LOG_GROUP_NAME"
] as string;

const clean_function_log_groupName = process.env[
  "CLEAN_FUNCTION_LOG_GROUP_NAME"
] as string;

const store_function_log_groupName = process.env[
  "STORE_FUNCTION_LOG_GROUP_NAME"
] as string;

const dynamoDbTable = process.env["TABLENAME"];

const snsTopicARN = process.env["SNS_TOPIC_ARN"];

export {
  filter_function_log_groupName,
  clean_function_log_groupName,
  store_function_log_groupName,
  dynamoDbTable,
  snsTopicARN,
};
