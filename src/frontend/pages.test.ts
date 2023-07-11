import { NextFunction, Request, RequestHandler, Response } from "express";
import { getHandler, getRoute, Page } from "./pages";

// export const invoicesParamsGetter: PageParamsGetter<{
//   contract_id: string;
// }> = async (request) => {
//
// };

describe("Page", () => {
  const homePage: Page<{}> = {
    title: "homePage",
    relativePath: "",
    njk: "",
    paramsGetter: async (_) => {},
  };
  const childType1Page: Page<{}> = {
    title: "childType1",
    relativePath: ":child_id/childType1",
    paramsGetter: async (_) => {},
    njk: "",
    parent: homePage,
  };
  const childType2Page: Page<{}> = {
    title: "childType2",
    relativePath: "childType2",
    paramsGetter: async (_) => {},
    njk: "",
    parent: homePage,
  };
  const grandchildTypePage: Page<{}> = {
    title: "grandchildType",
    relativePath: "grandchildType",
    paramsGetter: jest.fn().mockResolvedValue({ some_id: "someValue" }),
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
    } as jest.MockedObject<Response>;

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
            text: "childType1",
            href: "/someId/childType1",
          },
        ],
      },
      some_id: "someValue",
    });
  });
});
