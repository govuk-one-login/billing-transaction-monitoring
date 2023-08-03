import { NextFunction, Request, RequestHandler, Response } from "express";
import { getHandler, getRoute, getUrl, Page } from "./pages";

describe("Page", () => {
  let homePage: Page<{}, {}>;
  let childType1Page: Page<{}, {}>;
  let childType2Page: Page<{}, {}>;
  let grandchildTypePage: Page<{}, {}>;

  beforeEach(() => {
    jest.resetAllMocks();

    homePage = {
      relativePath: "",
      njk: "",
      paramsGetter: async (_) => ({}),
      titleGetter: async () => "homePage",
    };
    childType1Page = {
      relativePath: ":child_id/childType1",
      paramsGetter: async (_) => ({}),
      njk: "",
      parent: homePage,
      titleGetter: async () => "ChildType1",
    };
    childType2Page = {
      relativePath: "childType2",
      paramsGetter: async (_) => ({}),
      njk: "",
      parent: homePage,
      titleGetter: async () => "ChildType2",
    };
    grandchildTypePage = {
      relativePath: "grandchildType",
      paramsGetter: jest.fn().mockResolvedValue({
        some_id: "someValue",
      }),
      njk: "grandchild.njk",
      parent: childType1Page,
      titleGetter: async () => "GrandchildType",
    };
  });

  test("getRoute", () => {
    expect(getRoute(homePage)).toEqual("/");
    expect(getRoute(childType1Page)).toEqual("/:child_id/childType1");
    expect(getRoute(childType2Page)).toEqual("/childType2");
    expect(getRoute(grandchildTypePage)).toEqual(
      "/:child_id/childType1/grandchildType"
    );
  });

  test("getUrl", () => {
    expect(getUrl(homePage, {})).toEqual("/");
    expect(getUrl(childType1Page, { child_id: "sophie" })).toEqual(
      "/sophie/childType1"
    );
    expect(getUrl(childType2Page, {})).toEqual("/childType2");
    expect(getUrl(grandchildTypePage, { child_id: "kevin" })).toEqual(
      "/kevin/childType1/grandchildType"
    );

    try {
      getUrl(grandchildTypePage, {});
      fail("Expected exception");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toEqual(
        "Request parameter `:child_id` not found for URL: /:child_id/childType1/grandchildType"
      );
    }
  });

  describe("getHandler", () => {
    let mockedNextFunction: NextFunction;
    let mockedRequest: Request;
    let mockedResponse: jest.Mocked<Response>;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      mockedRequest = {
        params: {
          child_id: "someId",
        },
      } as unknown as jest.MockedObject<Request>;

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      mockedResponse = {
        render: jest.fn(),
        locals: {
          cspNonce: "someCsp",
        },
      } as any;

      mockedNextFunction = jest.fn();
    });

    test("success", async () => {
      const handler: RequestHandler = getHandler(grandchildTypePage);
      handler(mockedRequest, mockedResponse, mockedNextFunction);

      // Wait for pending promises
      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(mockedResponse.render).toHaveBeenCalledWith(
        grandchildTypePage.njk,
        {
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
          cookiesLink: { text: "Cookies", href: "/cookies" },
          some_id: "someValue",
          cspNonce: "someCsp",
        }
      );
      expect(mockedNextFunction).not.toHaveBeenCalled();
    });

    test("failure", async () => {
      const mockedError = Error("mocked error");
      mockedResponse.render.mockImplementation(() => {
        throw mockedError;
      });

      const handler: RequestHandler = getHandler(grandchildTypePage);
      handler(mockedRequest, mockedResponse, mockedNextFunction);

      // Wait for pending promises
      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(mockedNextFunction).toHaveBeenCalledTimes(1);
      expect(mockedNextFunction).toHaveBeenCalledWith(mockedError);
    });
  });
});
