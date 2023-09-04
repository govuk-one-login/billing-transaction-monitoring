import { invokeSyntheticLambda } from "../../src/handlers/int-test-support/helpers/lambdaHelper";

describe("\n Synthetic Events Generation Tests\n", () => {
  test("should generate events if the current date is between start_date and end_date and frequency is monthly", async () => {
    const result = await invokeSyntheticLambda("");
    expect(result.statusCode).toBe(200);
  });
});
