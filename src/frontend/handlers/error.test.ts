import { pageTitleFormatter } from "../utils/title";
import { errorParamsGetter } from "./error";

jest.mock("../utils/title");
const mockedPageTitleFormatter = pageTitleFormatter as jest.Mock;

describe("error handler", () => {
  let mockedHeadTitle: string;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedHeadTitle = "mocked head title";
    mockedPageTitleFormatter.mockReturnValue(mockedHeadTitle);
  });

  test("Page displays error", async () => {
    const givenRequest = "given request";

    const result = await errorParamsGetter(givenRequest as any);

    expect(result).toEqual({
      headTitle: mockedHeadTitle,
      pageTitle: "Sorry, there is a problem with the service",
      cookiesLink: { text: "Cookies", href: "/cookies" },
    });
  });
});
