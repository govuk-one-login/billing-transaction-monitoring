import { addFauxDataToTestPaths, TestPaths } from "./addFauxDataToTestPaths";

describe("addFauxDataToTestPaths", () => {
  describe("Given an array of test paths and record containing hardcoded data", () => {
    it("merges the hardcoded data into each test path", () => {
      const testPaths: TestPaths = [
        {
          givenEntity: "entity1",
          givenLoa: "loa1",
          givenStatus: "status1",
          expectedPath: "happy",
          expectedEventId: "123",
          expectedEventName: "test_event",
          expectedClientId: "client1",
        },
        {
          givenEntity: "entity2",
          givenLoa: "loa2",
          givenStatus: "status2",
          expectedPath: "sad",
          expectedEventId: "123",
          expectedEventName: "test_event",
          expectedClientId: "client1",
        },
      ];
      const fauxData = {
        a: "thing1",
        b: "thing2",
        c: "thing3",
      };
      const expectedTestPathsWithAdditionalData = [
        {
          givenEntity: "entity1",
          givenLoa: "loa1",
          givenStatus: "status1",
          expectedPath: "happy",
          expectedEventId: "123",
          expectedEventName: "test_event",
          expectedClientId: "client1",
          a: "thing1",
          b: "thing2",
          c: "thing3",
        },
        {
          givenEntity: "entity2",
          givenLoa: "loa2",
          givenStatus: "status2",
          expectedPath: "sad",
          expectedEventId: "123",
          expectedEventName: "test_event",
          expectedClientId: "client1",
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
