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
          eventId: "123",
          eventName: "test_event",
          clientId: "client1",
        },
        {
          entity: "entity2",
          loa: "loa2",
          status: "status2",
          path: "sad",
          eventId: "123",
          eventName: "test_event",
          clientId: "client1",
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
          eventId: "123",
          eventName: "test_event",
          clientId: "client1",
          a: "thing1",
          b: "thing2",
          c: "thing3",
        },
        {
          entity: "entity2",
          loa: "loa2",
          status: "status2",
          path: "sad",
          eventId: "123",
          eventName: "test_event",
          clientId: "client1",
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
