import { clearTimeout } from "timers";
import { logger } from "./logger";

export const callWithTimeout =
  (timeoutMillis = 5000) =>
  <TArgs, TResolution>(
    asyncFunc: (underlyingArgs: TArgs) => Promise<TResolution>
  ) =>
  async (...underlyingArgs: any): Promise<TResolution> =>
    await new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error("Operation timed out"));
      }, timeoutMillis);
      asyncFunc.apply(null, underlyingArgs).then(
        (result) => {
          clearTimeout(timeoutHandle);
          resolve(result);
        },
        (error) => {
          clearTimeout(timeoutHandle);
          reject(error);
        }
      );
    });

export const callWithRetry =
  (retries = 3) =>
  <TArgs, TResolution>(
    asyncFunc: (underlyingArgs: TArgs) => Promise<TResolution>,
    retryOnErrorMatching?: (error: Error) => boolean
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

/* eslint-disable @typescript-eslint/ban-types */

// This code is based on Redux Compose

export const compose = (...funcs: Function[]): Function => {
  if (funcs.length === 0) {
    // infer the argument type, so it is usable in inference down the line
    return <T>(arg: T) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(
    (a, b) =>
      (...args: unknown[]) =>
        a(b(...args))
  );
};
