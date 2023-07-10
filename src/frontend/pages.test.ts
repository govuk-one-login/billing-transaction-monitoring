import { NextFunction, Request, RequestHandler, Response } from "express";
import { getHandler, getRoute, Page } from "./pages";

describe("Page", () => {
  const homePage: Page<{}> = {
    title: "homePage",
    relativePath: "",
    njk: "",
    paramsGetter: async (_) => {},
  };
  const childPage1: Page<{}> = {
    title: "child1",
    relativePath: "child1",
    paramsGetter: async (_) => {},
    njk: "",
    parent: homePage,
  };
  const childPage2: Page<{}> = {
    title: "child2",
    relativePath: "child2",
    paramsGetter: async (_) => {},
    njk: "",
    parent: homePage,
  };
  const grandchildPage1: Page<{}> = {
    title: "grandchild1",
    relativePath: "grandchild1",
    paramsGetter: async (_) => {},
    njk: "",
    parent: childPage1,
  };

  test("getPagePath", () => {
    expect(getRoute(homePage)).toEqual("/");
    expect(getRoute(childPage1)).toEqual("/child1");
    expect(getRoute(childPage2)).toEqual("/child2");
    expect(getRoute(grandchildPage1)).toEqual("/child1/grandchild1");
  });

  test("getHandler", async () => {
    const getPageParams = jest
      .fn()
      .mockResolvedValue({ someField: "someValue" });

    const myPage: Page<{}> = {
      title: "myPage",
      relativePath: "myPage",
      paramsGetter: getPageParams,
      njk: "myPage.njk",
    };

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const mockedRequest: Request = {} as jest.MockedObject<Request>;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const mockedResponse: Response = {
      render: jest.fn(),
    } as jest.MockedObject<Response>;

    const mockedNextFunction: NextFunction =
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {} as jest.MockedObject<NextFunction>;

    const handler: RequestHandler = getHandler(myPage);
    await handler(mockedRequest, mockedResponse, mockedNextFunction);

    expect(mockedResponse.render).toHaveBeenCalledWith(myPage.njk, {
      someField: "someValue",
    });
  });
});
