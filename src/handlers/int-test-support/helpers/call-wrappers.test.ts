import {
  callWithRetry,
  callWithRetryAndTimeout,
  callWithTimeout,
  RetryErrorFilter,
} from "./call-wrappers";

describe("callWithTimeout", () => {
  const wait = async (milliseconds: number): Promise<string> => {
    return await new Promise((resolve) =>
      setTimeout(() => resolve("a"), milliseconds)
    );
  };

  const oneSecondCall = async (): Promise<string> => await wait(1000);

  describe("given a call that takes shorter than the timeout", () => {
    it("does not fail with a timeout error", async () => {
      // give it a second and a half to complete
      const result = await callWithTimeout(1500)(oneSecondCall)();
      expect(result).toBe("a");
    });
  });

  describe("given a call that takes longer than the timeout", () => {
    it("fails with a timeout error", async () => {
      await expect(callWithTimeout(500)(oneSecondCall)()).rejects.toThrowError(
        new Error("Operation timed out")
      );
    });
  });
});

describe("callWithRetry", () => {
  describe("given a function that succeeds the first time", () => {
    it("successfully retrieves the value", async () => {
      const asyncFunc = jest.fn(async (): Promise<string> => "a");
      const result = await callWithRetry(3)(asyncFunc)();
      expect(result).toBe("a");
      expect(asyncFunc).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a function that fails on first call, then succeeds", () => {
    let fail: boolean;

    beforeEach(() => {
      fail = true;
    });

    const failsOnce = async (): Promise<string> =>
      await new Promise((resolve, reject) => {
        if (fail) {
          fail = false;
          reject(new Error("some failure"));
        } else {
          resolve("a");
        }
      });

    it("successfully retrieves the value if no error filter applied", async () => {
      const result = await callWithRetry(3)(failsOnce)();
      expect(result).toBe("a");
    });

    it("successfully retrieves the value if error filter matches the error thrown", async () => {
      const errorFilter: RetryErrorFilter = (error) =>
        error.message === "some failure";
      const result = await callWithRetry(3, errorFilter)(failsOnce)();
      expect(result).toBe("a");
    });

    it("fails when error thrown that doesn't match the error filter", async () => {
      const errorFilter: RetryErrorFilter = (error) =>
        error.message === "some other failure";
      await expect(
        callWithRetry(3, errorFilter)(failsOnce)()
      ).rejects.toThrowError(new Error("some failure"));
    });
  });

  describe("given a function that fails consistently", () => {
    let attempt: number;
    beforeEach(() => {
      attempt = 0;
    });
    const alwaysFailsWithIncrementingErrorMessage = async (): Promise<void> => {
      attempt++;
      throw new Error(`failure on attempt ${attempt}`);
    };

    describe("when using the default retry option of always retrying", () => {
      it("fails to retrieve a value", async () => {
        await expect(
          callWithRetry(3)(alwaysFailsWithIncrementingErrorMessage)()
        ).rejects.toThrowError(new Error("Ran out of retries"));
      });
    });

    describe("when using a retry option that doesn't match the thrown error", () => {
      it("fails with the first error thrown", async () => {
        await expect(
          callWithRetry(
            3,
            (error: Error): boolean => error.message === "some other error"
          )(alwaysFailsWithIncrementingErrorMessage)()
        ).rejects.toThrowError(new Error("failure on attempt 1"));
      });
    });
  });
});

describe("callWithRetryAndTimeout", () => {
  describe("given a function that times out then succeeds", () => {
    it("successfully retrieves the value", async () => {
      const wait = async (milliseconds: number): Promise<string> => {
        return await new Promise((resolve) =>
          setTimeout(() => resolve("a"), milliseconds)
        );
      };

      let delay = 2500;
      const slowFirstCall = async (): Promise<string> => {
        delay -= 1000;
        return await wait(delay);
      };

      const result = await callWithRetryAndTimeout(slowFirstCall)();
      expect(result).toBe("a");
    });
  });
});
