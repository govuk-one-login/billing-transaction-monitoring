import { getPagePath, Page } from "./pages";

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

  test("getPath", () => {
    expect(getPagePath(homePage)).toEqual("/");
    expect(getPagePath(childPage1)).toEqual("/child1");
    expect(getPagePath(childPage2)).toEqual("/child2");
    expect(getPagePath(grandchildPage1)).toEqual("/child1/grandchild1");
  });
});
