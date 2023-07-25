import { pageTitleFormatter } from "../utils";
import { errorParamsGetter } from "./error";

jest.mock("../utils");
const mockedPageTitleFormatter = pageTitleFormatter as jest.Mock;

describe("error handler", () => {
  let mockedHeadTitle: string;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedHeadTitle = "mocked head title";
    mockedPageTitleFormatter.mockReturnValue(mockedHeadTitle);
  });

  test("Page displays all contracts", async () => {
    const givenRequest = "given request";

    const result = await errorParamsGetter(givenRequest as any);

    expect(result).toEqual({
      headTitle: mockedHeadTitle,
      pageTitle: "Sorry, there is a problem with the service",
    });
  });
});
