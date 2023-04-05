import { clearTimeout } from "timers";
import { logger } from "../../../shared/utils";

const TIMEOUT_MESSAGE = "Operation timed out";

const DEFAULT_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;

export type RetryErrorFilter = (error: Error) => boolean;
const ALWAYS_RETRY: RetryErrorFilter = (_: Error): boolean => true;
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
  (retries = DEFAULT_RETRIES, retryOnErrorMatching = ALWAYS_RETRY) =>
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
        if (error instanceof Error && retryOnErrorMatching(error)) {
          logger.warn(`Retrying on error: ${error.message}`);
          return await callWithRetry(
            retries - 1,
            retryOnErrorMatching
          )(asyncFunc).apply(null, underlyingArgs);
        } else {
          throw error;
        }
      }
    }
  };
