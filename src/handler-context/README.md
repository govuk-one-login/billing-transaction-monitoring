# `handler-context`

This code is designed to help devs to write Lambda function handlers in a way which separates business logic from common input and output functionality

Note: this documentation might be out of date. Please update it as you change the code!

Here is an example of how to make a Lambda handler with this code:

```ts
export const handler = buildHandler({
  envVars,
  ConfigCache,
  incomingMessageBodyTypeGuard,
  businessLogic,
  outputs,
  withBatchItemFailures,
});
```

## `envVars`

`envVars` defines which environment variables the handler can use

Should any specified variable not exist in the handler's execution environment when it runs, `buildHandler` will throw an error with a message which lists the missing variables

`envVars` must be an array of strings of the type `EnvVarName` in `src/shared/utils/env.ts`, so add new strings there for any additional environment variables which you would like to use

## `ConfigCache`

`ConfigCache` defines which runtime config file data the handler can use from the private config repo

`ConfigCache` must be an array of values from `ConfigElements` in `src/shared/utils/constants.ts`

## `incomingMessageBodyTypeGuard`

`incomingMessageBodyTypeGuard` validates data for each record in the event which triggers the Lambda function

`incomingMessageBodyTypeGuard` must be [a TypeScript type guard](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) which takes one argument. For S3 events, and SQS events with S3 event records, the argument will be a string of the text content in the file specified by the S3 record. For other SQS events, it will be the result of parsing the record body as JSON

`buildHandler` runs `incomingMessageBodyTypeGuard` for each record in the triggering event and throws an error should the result for any of them be `false`

## `businessLogic`

`businessLogic` generates output data from input data

`buildHandler` runs this function for each record in the triggering event, passing the data validated by `incomingMessageBodyTypeGuard` and a context object which includes the environment variables defined by `envVars` and config data defined by `ConfigCache` along with the value of `outputs` and an [AWS Lambda Powertools Logger](https://docs.powertools.aws.dev/lambda/typescript/latest/core/logger/). Should the triggering event be an S3 event, or an SQS event with S3 records, then `businessLogic` will also get a third argument, `meta`, which is an object with the `bucketName` and `key` of the S3 file for the given record data

`businessLogic` must return an array of output objects and/or strings

## `outputs`

`outputs` defines what to do with the output data from `businessLogic`

`outputs` must be an array of objects with two properties: a `destination` string, which can be used to determine where to send output, and a `store` function, which `buildHandler` runs for each output item from `businessLogic` by passing as arguments the `destination`, output item, and context object (same as the one passed to `businessLogic`)

## `withBatchItemFailures`

By default, `buildHandler` will throw an uncaught error should there be any issues with parsing or validating event records or running business logic or output storage functions, thus preventing any remaining steps from running. Sometimes, however, Amazon services will detect when a Lambda function handler returns an object with a `batchItemFailures` array of record ID strings, and they will handle those failing records with additional logic. In these cases, you can set `withBatchItemFailures` to `true`, which will cause the handler to return the ID of any failing records accordingly where possible, instead of simply throwing an error, allowing any remaining records to run through any remaining handler steps
