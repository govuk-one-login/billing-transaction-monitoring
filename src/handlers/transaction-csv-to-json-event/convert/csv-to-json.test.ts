import { csvToJson } from "./csv-to-json";

describe("csvToJson", () => {
  describe("given a valid csv", () => {
    it("converts to it a json with modified keys", async () => {
      const givenCsv = `a,b,c,color\n1,henry,135000,red\n2,henrietta,155000,pink`;
      const expectedResult = [
        {
          id: "1",
          name: "henry",
          suction: "135000",
          color: "red",
        },
        {
          id: "2",
          name: "henrietta",
          suction: "155000",
          color: "pink",
        },
      ];
      const givenRenamingMap = new Map([
        ["a", "id"],
        ["b", "name"],
        ["c", "suction"],
      ]);
      const result = await csvToJson(givenCsv, givenRenamingMap);
      expect(result).toEqual(expectedResult);
    });
    describe("given an invalid csv", () => {
      it("throws an error", async () => {
        const givenInvalidCsv = `an invalid csv`;
        await expect(csvToJson(givenInvalidCsv, new Map())).rejects.toThrow("");
      });
    });
  });
});
