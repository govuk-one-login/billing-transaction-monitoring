import { Logger } from "@aws-lambda-powertools/logger";
import { ConfigFileNames } from "../../handler-context/config/types";

export interface Message {
  event_name: string;
}

export enum Env {
  OUTPUT_QUEUE_URL = "OUTPUT_QUEUE_URL",
}

export type ConfigFiles = ConfigFileNames.services;

const logger = new Logger();

export const callWithRetry =
  (retries = 3, retryOnErrorMatching = (_: Error): boolean => true) =>
  <TArgs extends any[], TResolution>(
    asyncFunc: (...underlyingArgs: TArgs) => Promise<TResolution>
  ) =>
  async (...underlyingArgs: any): Promise<TResolution> =>
    await new Promise((resolve, reject) => {
      let isUnresolved = true;
      for (let i = 0; isUnresolved && i < retries; i++) {
        asyncFunc.apply(null, underlyingArgs).then(
          (result) => {
            isUnresolved = false;
            resolve(result);
          },
          (error) => {
            if (
              i < retries - 1 &&
              (!retryOnErrorMatching || retryOnErrorMatching(error))
            ) {
              logger.warn(`Retrying on error: ${error.message}`);
            } else {
              reject(error);
            }
          }
        );
      }
    });

export const callWithRetryV2 =
  (retries = 3, retryOnErrorMatching = (_: Error): boolean => true) =>
  <TArgs extends any[], TResolution>(
    asyncFunc: (...underlyingArgs: TArgs) => Promise<TResolution>
  ) =>
  async (...underlyingArgs: any): Promise<TResolution> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await asyncFunc.apply(null, underlyingArgs);
      } catch (error) {
        if (
          i < retries - 1 &&
          (!retryOnErrorMatching || retryOnErrorMatching(error as Error))
        ) {
          logger.warn(`Retrying on error: ${(error as Error)?.message}`);
        } else {
          throw error;
        }
      }
    }
    throw new Error("Loop never resolved to a value");
  };

export const callWithRetryV3 =
  (retries = 3, retryOnErrorMatching = (_: Error): boolean => true) =>
  <TArgs extends any[], TResolution>(
    asyncFunc: (...underlyingArgs: TArgs) => Promise<TResolution>
  ) =>
  async (...underlyingArgs: any): Promise<TResolution> => {
    if (retries <= 0) {
      throw new Error("Ran out of retries");
    } else {
      try {
        return await asyncFunc.apply(null, underlyingArgs);
      } catch (error) {
        if (retryOnErrorMatching(error as Error)) {
          logger.warn(`Retrying on error: ${(error as Error)?.message}`);
          return await callWithRetryV3(
            retries - 1,
            retryOnErrorMatching
          )(asyncFunc).apply(null, underlyingArgs);
        } else {
          throw error;
        }
      }
    }
  };
