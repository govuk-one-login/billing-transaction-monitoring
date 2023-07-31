import { errorParamsGetter } from "./error";

describe("error handler", () => {
  test("Page displays error", async () => {
    const givenRequest = "given request";

    const result = await errorParamsGetter(givenRequest as any);

    expect(result).toEqual({});
  });
});
