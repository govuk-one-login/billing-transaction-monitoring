import { addFauxDataToTestPaths, TestPaths } from "./addFauxDataToTestPaths";

describe("addFauxDataToTestPaths", () => {
  describe("Given an array of test paths and record containing hardcoded data", () => {
    it("merges the hardcoded data into each test path", () => {
      const testPaths: TestPaths = [
        {
          entity: "entity1",
          loa: "loa1",
          status: "status1",
          path: "happy",
        },
        {
          entity: "entity2",
          loa: "loa2",
          status: "status2",
          path: "sad",
        },
      ];
      const fauxData = {
        a: "thing1",
        b: "thing2",
        c: "thing3",
      };
      const expectedTestPathsWithAdditionalData = [
        {
          entity: "entity1",
          loa: "loa1",
          status: "status1",
          path: "happy",
          a: "thing1",
          b: "thing2",
          c: "thing3",
        },
        {
          entity: "entity2",
          loa: "loa2",
          status: "status2",
          path: "sad",
          a: "thing1",
          b: "thing2",
          c: "thing3",
        },
      ];
      const testPathsWithAdditionalData = addFauxDataToTestPaths(
        testPaths,
        fauxData
      );
      expect(testPathsWithAdditionalData).toEqual(
        expectedTestPathsWithAdditionalData
      );
    });
  });
});
