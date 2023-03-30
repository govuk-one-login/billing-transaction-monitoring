import { clearTimeout } from "timers";
import { logger } from "../../../shared/utils";

export interface RetryAndTimeoutOptions {
  retries?: number;
  retryOnErrorFilter?: (error: Error) => boolean;
  timeout?: number;
}

const TIMEOUT_MESSAGE = "Operation timed out";

export const callWithRetryAndTimeout = <T extends any[], U>(
  asyncFunc: (...args: T) => Promise<U>
): ((...args: T) => Promise<U>) =>
  callWithRetry()(callWithTimeout()(asyncFunc));

export const callWithTimeout =
  (timeoutMillis = 5000) =>
  <TArgs extends any[], TResolution>(
    asyncFunc: (...underlyingArgs: TArgs) => Promise<TResolution>
  ) =>
  async (...underlyingArgs: any): Promise<TResolution> =>
    await new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error(TIMEOUT_MESSAGE));
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
  (retries = 3, retryOnErrorMatching?: (error: Error) => boolean) =>
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
