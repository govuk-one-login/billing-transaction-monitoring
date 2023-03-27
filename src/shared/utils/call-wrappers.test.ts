import { callWithRetry, callWithTimeout } from "./call-wrappers";

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
      const result = await callWithTimeout(oneSecondCall, 1500)();
      expect(result).toBe("a");
    });
  });

  describe("given a call that takes longer than the timeout", () => {
    it("fails with a timeout error", async () => {
      try {
        // only give it a half a second to complete
        await callWithTimeout(oneSecondCall, 500)();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Operation timed out");
      }
      expect.hasAssertions();
    });
  });
});

describe("callWithRetry", () => {
  describe("given a function that succeeds the first time", () => {
    it("successfully retrieves the value", async () => {
      const result = await callWithRetry(
        async () => await new Promise((resolve) => resolve("a")),
        3
      )();
      expect(result).toBe("a");
    });
  });

  describe("given a function that fails then succeeds", () => {
    it("successfully retrieves the value", async () => {
      let fail = true;

      const result = await callWithRetry(
        async () =>
          await new Promise((resolve, reject) => {
            if (fail) {
              fail = false;
              reject(new Error("some failure"));
            } else {
              resolve("a");
            }
          }),
        3
      )();
      expect(result).toBe("a");
    });
  });

  describe("given a function that fails consistently", () => {
    it("fails to retrieve a value and throws the error from the final attempt", async () => {
      let attempt = 0;

      try {
        await callWithRetry(
          async () =>
            await new Promise((resolve, reject) => {
              attempt++;
              reject(new Error(`failure on attempt ${attempt}`));
            }),
          3
        )();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("failure on attempt 3");
      }
      expect.hasAssertions();
    });
  });
});

describe("timeout within retry", () => {
  describe("given a function that times out then succeeds", () => {
    it("successfully retrieves the value", async () => {
      const wait = async (milliseconds: number): Promise<string> => {
        return await new Promise((resolve) =>
          setTimeout(() => resolve("a"), milliseconds)
        );
      };

      let delay = 2500;
      const firstCallTooSlow = async (): Promise<string> => {
        delay -= 1000;
        return await wait(delay);
      };

      const result = await callWithRetry(
        async () => await callWithTimeout(firstCallTooSlow, 1000)(),
        3
      )();
      expect(result).toBe("a");
    });
  });
});
