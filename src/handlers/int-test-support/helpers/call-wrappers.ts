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
    for (let i = 0; i < retries; i++) {
      try {
        const result = await asyncFunc.apply(null, underlyingArgs);
        if (result) {
          return result;
        }
      } catch (error: any) {
        if (
          i < retries - 1 &&
          (!retryOnErrorMatching || retryOnErrorMatching(error))
        ) {
          logger.warn(`Retrying on error: ${error.message}`);
        } else {
          throw error;
        }
      }
    }
    throw new Error(`Failed after ${retries} retries`);
  };
