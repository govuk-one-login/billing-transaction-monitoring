import { clearTimeout } from "timers";

export const callWithTimeout =
  <TArgs, TResolution>(
    asyncFunc: (underlyingArgs: TArgs) => Promise<TResolution>,
    timeoutMillis = 5000
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
  <TArgs, TResolution>(
    asyncFunc: (underlyingArgs: TArgs) => Promise<TResolution>,
    retries = 3
  ) =>
  async (...underlyingArgs: any): Promise<TResolution> =>
    await new Promise((resolve, reject) => {
      for (let i = 0; i < retries; i++) {
        asyncFunc.apply(null, underlyingArgs).then(
          (result) => {
            resolve(result);
          },
          (error) => {
            console.log(error);
            if (i < retries - 1) {
              console.log("Retrying");
            } else {
              reject(error);
            }
          }
        );
      }
    });
