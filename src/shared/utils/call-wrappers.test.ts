import { callWithTimeout } from "./call-wrappers";

const wait = async (milliseconds: number): Promise<void> => {
  return await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

describe("callWithTimeout", () => {
  describe("given a call that takes longer than the timeout", () => {
    const slowCall = async (): Promise<void> => await wait(1000);

    it("fails with a timeout error", async () => {
      try {
        await callWithTimeout(slowCall, 500)();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Operation timed out");
      }
      expect.hasAssertions();
    });
  });
});
