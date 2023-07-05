import { getPagePath, Page } from "./pages";

describe("Page", () => {
  const homePage: Page = {
    relativePath: "",
    handler: () => {},
  };
  const childPage1: Page = {
    relativePath: "child1",
    handler: () => {},
    parent: homePage,
  };
  const childPage2: Page = {
    relativePath: "child2",
    handler: () => {},
    parent: homePage,
  };
  const grandchildPage1: Page = {
    relativePath: "grandchild1",
    handler: () => {},
    parent: childPage1,
  };

  test("getPath", () => {
    expect(getPagePath(homePage)).toEqual("/");
    expect(getPagePath(childPage1)).toEqual("/child1");
    expect(getPagePath(childPage2)).toEqual("/child2");
    expect(getPagePath(grandchildPage1)).toEqual("/child1/grandchild1");
  });
});
