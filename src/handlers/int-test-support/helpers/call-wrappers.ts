import { clearTimeout } from "timers";
import { logger } from "../../../shared/utils";

const TIMEOUT_MESSAGE = "Operation timed out";

const DEFAULT_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;

export type RetryErrorFilter = (error: Error) => boolean;
const NEVER_RETRY: RetryErrorFilter = (_: Error): boolean => false;
const RETRY_ON_TIMEOUT_ONLY: RetryErrorFilter = (error: Error): boolean =>
  error.message === TIMEOUT_MESSAGE;

export const callWithRetryAndTimeout = <T extends any[], U>(
  asyncFunc: (...args: T) => Promise<U>
): ((...args: T) => Promise<U>) =>
  callWithRetry(
    DEFAULT_RETRIES,
    RETRY_ON_TIMEOUT_ONLY
  )(callWithTimeout()(asyncFunc));

export const callWithTimeout =
  (timeoutMillis = DEFAULT_TIMEOUT) =>
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
  (retries = DEFAULT_RETRIES, retryOnErrorMatching = NEVER_RETRY) =>
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
