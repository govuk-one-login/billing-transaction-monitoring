import { SQSEvent } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { Response } from "../shared/types";
import { Config, ConfigFileNames } from "./Config";
import { S3ConfigFileClient } from "./S3ConfigClient";

export type OutputFunction = (
  destination: string,
  message: string
) => Promise<void>;

export type Outputs = Array<{
  destination: string;
  store: OutputFunction;
}>;

export type UserDefinedOutputFunction<TEnvVars extends string> = (
  destination: TEnvVars,
  message: string
) => Promise<void>;

export type UserDefinedOutputs<TEnvVars extends string> = Array<{
  destination: TEnvVars;
  store: UserDefinedOutputFunction<TEnvVars>;
}>;

export type BusinessLogicOutput = Array<{ _id: string }>;

export type BusinessLogic<
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
> = (
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
) => Promise<BusinessLogicOutput>;

export interface HandlerCtx<
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
> {
  env: Record<TEnvVars, string>;
  messages: Array<TMessage & { _id: string }>;
  logger: Logger;
  outputs: Outputs;
  config: Config<TConfigFileNames>["_cache"];
}

export type Handler<
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
> = (
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
) => Promise<Response>;

interface CtxBuilderOptions<TMessage, TEnvVars extends string> {
  envVars: TEnvVars[];
  messageTypeGuard: (maybeMessage: unknown) => maybeMessage is TMessage;
  outputs: UserDefinedOutputs<TEnvVars>;
  configFiles: ConfigFileNames[];
}

export const addEnvToCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  envVarsKeys: TEnvVars[],
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> => {
  const { isEnvValid, missingVars, env } = envVarsKeys.reduce<{
    isEnvValid: boolean;
    missingVars: string[];
    env: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>["env"];
  }>(
    (acc, envVarKey) => {
      const envVar = process.env[envVarKey];
      if (envVar === undefined || !envVarKey?.length) {
        acc.isEnvValid = false;
        acc.missingVars = [...acc.missingVars, envVarKey];
      } else {
        acc.env = {
          ...acc.env,
          [envVarKey]: envVar,
        };
      }
      return acc;
    },
    {
      isEnvValid: true,
      missingVars: [],
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      env: {} as HandlerCtx<TMessage, TEnvVars, TConfigFileNames>["env"],
    }
  );
  if (!isEnvValid) {
    ctx.logger.error(`Environment is not valid, missing ${missingVars.join()}`);
    throw new Error(`Environment is not valid`);
  }

  return { ...ctx, env };
};

// N.B. this is an adaptor from SQSEvents to domain messages
export const addMessagesToCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  { Records }: SQSEvent,
  messageTypeGuard: (maybeMessage: any) => maybeMessage is TMessage,
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> => {
  const messages = Records.map<
    HandlerCtx<TMessage, TEnvVars, TConfigFileNames>["messages"][0]
  >(({ messageId: _id, body: rawBody }) => {
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      ctx.logger.error(`Received a message whose body was not valid JSON`);
      throw new Error(`Could not process message ${_id}`);
    }
    const messageIsExpectedType = messageTypeGuard(body);
    if (!messageIsExpectedType) {
      ctx.logger.error(
        `Received a message which did not conform to the expected type`
      );
      throw new Error(`Could not process message ${_id}`);
    }
    // we attach the _id to the message so that we can handle batch item failures
    return { ...body, _id };
  });
  return { ...ctx, messages };
};

export const addLoggerToCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> => {
  return { ...ctx, logger: new Logger() };
};

export const addOutputsToCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  outputs: UserDefinedOutputs<TEnvVars>,
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> => {
  return {
    ...ctx,
    outputs: outputs.map(({ destination, store }) => ({
      destination: ctx.env[destination],
      store: store as OutputFunction,
    })),
  };
};

export const outputMessages = async <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  results: BusinessLogicOutput,
  { outputs }: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): Promise<Response> => {
  const promises = results
    .map(({ _id, ...body }) =>
      outputs.map<Promise<string>>(
        async ({ destination, store }) =>
          await new Promise((resolve, reject) => {
            store(destination, JSON.stringify(body)).then(
              () => resolve(_id),
              () => reject(_id)
            );
          })
      )
    )
    .flat();

  return await Promise.allSettled(promises).then((resolutions) =>
    resolutions.reduce<Response>(
      (response, outputPromise) => {
        if (outputPromise.status === "fulfilled") return response;
        return {
          ...response,
          batchItemFailures: [
            ...response.batchItemFailures,
            outputPromise.reason,
          ],
        };
      },
      { batchItemFailures: [] }
    )
  );
};

export const addConfigToCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(
  files: TConfigFileNames[],
  ctx: HandlerCtx<TMessage, TEnvVars, TConfigFileNames>
): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> => {
  const config = new Config(new S3ConfigFileClient(), files).getCache();
  return { ...ctx, config };
};

export const getBlankCtx = <
  TMessage,
  TEnvVars extends string,
  TConfigFileNames extends ConfigFileNames
>(): HandlerCtx<TMessage, TEnvVars, TConfigFileNames> =>
  ({} as unknown as HandlerCtx<TMessage, TEnvVars, TConfigFileNames>);

export const buildHandler =
  <
    TMessage,
    TEnvVars extends string,
    TConfigFileNames extends ConfigFileNames
  >({
    envVars,
    messageTypeGuard,
    outputs,
    configFiles,
  }: CtxBuilderOptions<TMessage, TEnvVars>) =>
  (businessLogic: BusinessLogic<TMessage, TEnvVars, TConfigFileNames>) =>
  (event: SQSEvent) => {
    // for the love of god find a nicer way to do this chain
    const ctx = addConfigToCtx(
      configFiles,
      addOutputsToCtx(
        outputs,
        addMessagesToCtx(
          event,
          messageTypeGuard,
          addEnvToCtx(envVars, addLoggerToCtx(getBlankCtx()))
        )
      )
    );
    return async () => {
      const results = await businessLogic(ctx);
      return await outputMessages(results, ctx);
    };
  };

// Spin up some classes that model the config repo
// so we can have config in the context. You should
// be able to specify which bits on config a
// given business blob depends on to negate over-fetching

// That'll solve some of the fetching but what about the
// bits where we need to go get something from a bucket
// when the message says that something's been put there?

// I think that'll be an extension of addMessagesToCtx.
// at the minute that's specific to SQSEvents but to
// work with the transaction csv to json events lambda
// it'll need to toggle to a different modality to handle
// S3Events
