import { poll } from "./commonHelpers";

describe("poll", () => {
  describe("given a promise that rejects", () => {
    it("rejects", async () => {
      const err = new Error("oops");
      try {
        await poll(
          async () =>
            // eslint-disable-next-line @typescript-eslint/return-await
            Promise.reject(err),
          () => true
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Error: " + err.message);
      }
      expect.hasAssertions();
    });
  });

  describe("given a promise that never resolves to the desired outcome", () => {
    it("rejects", async () => {
      try {
        await poll(
          async () =>
            // eslint-disable-next-line @typescript-eslint/return-await
            Promise.resolve("a"),
          (response) => response === "b",
          { interval: 100, timeout: 1_000 }
        );
      } catch (error) {
        expect(error).toBe("Polling completion condition was never achieved");
      }
      expect.hasAssertions();
    });
  });

  describe("given a promise that takes longer than the given timeout to resolve", () => {
    it("rejects", async () => {
      try {
        await poll(
          async () =>
            // eslint-disable-next-line @typescript-eslint/return-await
            new Promise((resolve) => {
              // resolves to the completion condition but takes 2 seconds
              setTimeout(() => {
                resolve("a");
              }, 2000);
            }),
          (response) => response === "a",
          {
            interval: 100,
            timeout: 1_000, // we give up on polling after 1 second
          }
        );
      } catch (error) {
        expect(error).toBe("Polling completion condition was never achieved");
      }
      expect.hasAssertions();
    });
  });

  describe("given a promise that resolves to the desired outcome sooner than we timeout", () => {
    it("resolves to the desired outcome", async () => {
      const response = await poll(
        async () =>
          // eslint-disable-next-line @typescript-eslint/return-await
          new Promise((resolve) => {
            // resolves to the completion condition in half a second
            setTimeout(() => {
              resolve("a");
            }, 500);
          }),
        (response) => response === "a",
        {
          interval: 100,
          timeout: 1_000, // we give up on polling after 1 second
        }
      );

      expect(response).toBe("a");
    });

    it("does not spawn unnecessary promises", async () => {
      const underlyingPromise = jest.fn(
        async () =>
          // eslint-disable-next-line @typescript-eslint/return-await
          new Promise((resolve) => {
            // resolves to the completion condition after 450ms
            setTimeout(() => {
              resolve("a");
            }, 450);
          })
      );
      await poll(underlyingPromise, (response) => response === "a", {
        interval: 100, // we poll every 100ms
        timeout: 1_000, // we give up on polling after 1 second
      });

      expect(underlyingPromise).toHaveBeenCalledTimes(1);
    });
  });
});
