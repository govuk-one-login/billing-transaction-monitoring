import { NextFunction, Request, RequestHandler, Response } from "express";
import { getHandler, getRoute, Page } from "./pages";

describe("Page", () => {
  const homePage: Page<{}, {}> = {
    relativePath: "",
    njk: "",
    paramsGetter: async (_) => ({ pageTitle: "homePage" }),
  };
  const childType1Page: Page<{}, {}> = {
    relativePath: ":child_id/childType1",
    paramsGetter: async (_) => ({ pageTitle: "ChildType1" }),
    njk: "",
    parent: homePage,
  };
  const childType2Page: Page<{}, {}> = {
    relativePath: "childType2",
    paramsGetter: async (_) => ({ pageTitle: "ChildType2" }),
    njk: "",
    parent: homePage,
  };
  const grandchildTypePage: Page<{}, {}> = {
    relativePath: "grandchildType",
    paramsGetter: jest
      .fn()
      .mockResolvedValue({ pageTitle: "GrandchildType", some_id: "someValue" }),
    njk: "grandchild.njk",
    parent: childType1Page,
  };

  test("getRoute", () => {
    expect(getRoute(homePage)).toEqual("/");
    expect(getRoute(childType1Page)).toEqual("/:child_id/childType1");
    expect(getRoute(childType2Page)).toEqual("/childType2");
    expect(getRoute(grandchildTypePage)).toEqual(
      "/:child_id/childType1/grandchildType"
    );
  });

  test("getHandler", async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const mockedRequest: Request = {
      params: {
        child_id: "someId",
      },
    } as unknown as jest.MockedObject<Request>;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const mockedResponse: Response = {
      render: jest.fn(),
      locals: {
        cspNonce: "someCsp",
      },
    } as any;

    const mockedNextFunction: NextFunction =
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {} as jest.MockedObject<NextFunction>;

    const handler: RequestHandler = getHandler(grandchildTypePage);
    await handler(mockedRequest, mockedResponse, mockedNextFunction);

    expect(mockedResponse.render).toHaveBeenCalledWith(grandchildTypePage.njk, {
      breadcrumbData: {
        items: [
          {
            text: "homePage",
            href: "/",
          },
          {
            text: "ChildType1",
            href: "/someId/childType1", // note id is formatted into path
          },
        ],
      },
      pageTitle: "GrandchildType",
      some_id: "someValue",
      cspNonce: "someCsp",
    });
  });
});
