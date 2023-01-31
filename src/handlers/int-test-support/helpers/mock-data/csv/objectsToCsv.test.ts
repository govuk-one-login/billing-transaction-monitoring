import { objectsToCSV } from "./objectsToCsv";

describe("objectsToCSV", () => {
  describe("Given an array of self-similar objects with numeric values", () => {
    it("Returns a CSV containing one row for each object", () => {
      const objects = [
        {
          a: 1,
          b: 2,
          c: 3,
        },
        {
          c: 6,
          a: 4,
          b: 5,
        },
      ];
      const expectedCsv = `a,b,c\n1,2,3\n4,5,6`;
      const csv = objectsToCSV(objects);
      expect(csv).toEqual(expectedCsv);
    });
  });
  describe("Given an array of self-similar objects with string values", () => {
    it("Returns a CSV containing one row for each object", () => {
      const objects = [
        {
          a: "thing1",
          b: "thing2",
          c: "thing3",
        },
        {
          a: "thing4",
          b: "thing5",
          c: "thing6",
        },
      ];
      const expectedCsv = `a,b,c\nthing1,thing2,thing3\nthing4,thing5,thing6`;
      const csv = objectsToCSV(objects);
      expect(csv).toEqual(expectedCsv);
    });
  });
  describe("Given a list of keys to filter", () => {
    it("removes those keys from the output", () => {
      const objects = [
        {
          a: "thing1",
          b: "thing2",
          c: "thing3",
        },
        {
          a: "thing4",
          c: "thing6",
          b: "thing5",
        },
      ];
      const expectedCsv = `b\nthing2\nthing5`;
      const csv = objectsToCSV(objects, { filterKeys: ["a", "c"] });
      expect(csv).toEqual(expectedCsv);
    });
  });
  describe("Given a dictionary of keys to rename", () => {
    it("renames those keys in the output", () => {
      const objects = [
        {
          a: "thing1",
          b: "thing2",
          c: "thing3",
        },
        {
          a: "thing4",
          b: "thing5",
          c: "thing6",
        },
      ];
      const expectedCsv = `z,e,c\nthing1,thing2,thing3\nthing4,thing5,thing6`;
      const csv = objectsToCSV(objects, {
        renameKeys: new Map([
          ["a", "z"],
          ["b", "e"],
        ]),
      });
      expect(csv).toEqual(expectedCsv);
    });
  });

  describe("Given a dictionary of keys to rename and a list of keys to filter", () => {
    it("renames specified keys and removes specified keys in the output", () => {
      const objects = [
        {
          a: "thing1",
          b: "thing2",
          c: "thing3",
        },
        {
          a: "thing4",
          b: "thing5",
          c: "thing6",
        },
      ];
      const expectedCsv = `z,e\nthing1,thing2\nthing4,thing5`;
      const csv = objectsToCSV(objects, {
        renameKeys: new Map([
          ["a", "z"],
          ["b", "e"],
        ]),
        filterKeys: ["c"],
      });
      expect(csv).toEqual(expectedCsv);
    });
  });
});
