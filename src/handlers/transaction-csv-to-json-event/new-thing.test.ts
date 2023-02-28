import {
  convert,
  infer,
  orchestrate,
  Inference,
  Transformations,
  Operations,
  Constructables,
  transform,
} from "./new-thing";

// using a type here because interface won't be interpreted
// as an extension of Record<string, unknown>
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type RawHoover = {
  id: string;
  name: string;
  suction: string;
  color: string;
};

describe("convert", () => {
  describe("given a valid csv", () => {
    it("converts to it a json with modified keys", async () => {
      const givenCsv = `a,b,c,color\n1,henry,135000,red\n2,henrietta,155000,pink`;
      const expectedResult: RawHoover[] = [
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
      const result = await convert(givenCsv, givenRenamingMap);
      expect(result).toEqual(expectedResult);
    });
    describe("given an invalid csv", () => {
      it("throws an error", async () => {
        const givenInvalidCsv = `an invalid csv`;
        await expect(convert(givenInvalidCsv, new Map())).rejects.toThrow("");
      });
    });
  });
});

describe("infer", () => {
  describe("given and array of objects and a set of rules", () => {
    it("infers things about the objects", () => {
      const givenArray: RawHoover[] = [
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
        {
          id: "3",
          name: "clive",
          suction: "135000",
          color: "red",
        },
      ];
      const givenInferences: Array<
        Inference<RawHoover, { eyelashLength: number; isOriginal: boolean }>
      > = [
        {
          field: "isOriginal",
          rules: [{ given: { name: "henry", color: "red" }, inferValue: true }],
          defaultValue: false,
        },
        {
          field: "eyelashLength",
          rules: [
            { given: { suction: "135000" }, inferValue: 12 },
            { given: { suction: "155000" }, inferValue: 16 },
          ],
          defaultValue: 6,
        },
      ];

      const result = infer<
        RawHoover,
        { eyelashLength: number; isOriginal: boolean }
      >(givenArray, givenInferences);
      expect(result).toEqual([
        {
          id: "1",
          name: "henry",
          suction: "135000",
          color: "red",
          isOriginal: true,
          eyelashLength: 12,
        },
        {
          id: "2",
          name: "henrietta",
          suction: "155000",
          color: "pink",
          isOriginal: false,
          eyelashLength: 16,
        },
        {
          id: "3",
          name: "clive",
          suction: "135000",
          color: "red",
          isOriginal: false,
          eyelashLength: 12,
        },
      ]);
    });
  });
});

describe("transform", () => {
  describe("given an array of objects and a set of transformations", () => {
    it("performs the transformations to timestampOfManufacture when given dateOfManufacture in human readable time", () => {
      type AugmentedHoover = RawHoover & {
        eyelashLength: number;
        isOriginal: boolean;
        dateOfManufacture: string | number;
      };
      const givenArray: AugmentedHoover[] = [
        {
          id: "1",
          name: "henry",
          suction: "135000",
          color: "red",
          isOriginal: true,
          eyelashLength: 12,
          dateOfManufacture: "2022-11-01T00:27:41.186Z",
        },
        {
          id: "2",
          name: "henrietta",
          suction: "155000",
          color: "pink",
          isOriginal: false,
          eyelashLength: 16,
          dateOfManufacture: "2022-11-01T00:27:41.186Z",
        },
      ];

      const givenTransformations: Transformations<
        AugmentedHoover,
        { timestampOfManufacture: number }
      > = [
        {
          inputKey: "dateOfManufacture",
          outputKey: "timestampOfManufacture",
          condition: /\d+-\d+-\d+T\d+:\d+:\d+.\d+Z/,
          operations: [
            {
              operation: Operations.construct,
              parameter: Constructables.date,
            },
            {
              operation: Operations.multiply,
              parameter: 0.001,
            },
            {
              operation: Operations.floor,
            },
          ],
        },
      ];

      const result = transform(givenArray, givenTransformations);

      expect(result).toEqual([
        {
          id: "1",
          name: "henry",
          suction: "135000",
          color: "red",
          isOriginal: true,
          eyelashLength: 12,
          dateOfManufacture: "2022-11-01T00:27:41.186Z",
          timestampOfManufacture: 1667262461,
        },
        {
          id: "2",
          name: "henrietta",
          suction: "155000",
          color: "pink",
          isOriginal: false,
          eyelashLength: 16,
          dateOfManufacture: "2022-11-01T00:27:41.186Z",
          timestampOfManufacture: 1667262461,
        },
      ]);
    });
    it("performs the transformations to timestampOfManufacture when given dateOfManufacture as milliseconds", () => {
      type AugmentedHoover = RawHoover & {
        eyelashLength: number;
        isOriginal: boolean;
        dateOfManufacture: string | number;
      };
      const givenArray: AugmentedHoover[] = [
        {
          id: "3",
          name: "clive",
          suction: "135000",
          color: "red",
          isOriginal: false,
          eyelashLength: 12,
          dateOfManufacture: "1667262461186",
        },
        {
          id: "4",
          name: "sonny",
          suction: "145000",
          color: "blue",
          isOriginal: false,
          eyelashLength: 6,
          dateOfManufacture: "1677601086489",
        },
      ];

      const givenTransformations: Transformations<
        AugmentedHoover,
        { timestampOfManufacture: number }
      > = [
        {
          inputKey: "dateOfManufacture",
          outputKey: "timestampOfManufacture",
          condition: /^\d{13}$/,
          operations: [
            {
              operation: Operations.construct,
              parameter: Constructables.number,
            },
            {
              operation: Operations.multiply,
              parameter: 0.001,
            },
            {
              operation: Operations.floor,
            },
          ],
        },
      ];

      const result = transform(givenArray, givenTransformations);

      expect(result).toEqual([
        {
          id: "3",
          name: "clive",
          suction: "135000",
          color: "red",
          isOriginal: false,
          eyelashLength: 12,
          dateOfManufacture: "1667262461186",
          timestampOfManufacture: 1667262461,
        },
        {
          id: "4",
          name: "sonny",
          suction: "145000",
          color: "blue",
          isOriginal: false,
          eyelashLength: 6,
          dateOfManufacture: "1677601086489",
          timestampOfManufacture: 1677601086,
        },
      ]);
    });
    it("performs the transformations to timestampOfManufacture when given dateOfManufacture as seconds", () => {
      type AugmentedHoover = RawHoover & {
        eyelashLength: number;
        isOriginal: boolean;
        dateOfManufacture: string | number;
      };
      const givenArray: AugmentedHoover[] = [
        {
          id: "5",
          name: "thelma",
          suction: "135000",
          color: "red",
          isOriginal: false,
          eyelashLength: 12,
          dateOfManufacture: "1677601086",
        },
        {
          id: "6",
          name: "louise",
          suction: "145000",
          color: "blue",
          isOriginal: false,
          eyelashLength: 6,
          dateOfManufacture: "1667262461",
        },
      ];

      const givenTransformations: Transformations<
        AugmentedHoover,
        { timestampOfManufacture: number }
      > = [
        {
          inputKey: "dateOfManufacture",
          outputKey: "timestampOfManufacture",
          condition: /^\d{10}$/,
          operations: [
            {
              operation: Operations.construct,
              parameter: Constructables.number,
            },
          ],
        },
      ];

      const result = transform(givenArray, givenTransformations);

      expect(result).toEqual([
        {
          id: "5",
          name: "thelma",
          suction: "135000",
          color: "red",
          isOriginal: false,
          eyelashLength: 12,
          dateOfManufacture: "1677601086",
          timestampOfManufacture: 1677601086,
        },
        {
          id: "6",
          name: "louise",
          suction: "145000",
          color: "blue",
          isOriginal: false,
          eyelashLength: 6,
          dateOfManufacture: "1667262461",
          timestampOfManufacture: 1667262461,
        },
      ]);
    });
  });
});

describe("orchestrator", () => {
  describe("given an array of objects, a map to rename the header row,  a set of rules and operations to transform", () => {
    it("renames, infers additional details and transforms specified fields about the objects", async () => {
      type AugmentedHoover = RawHoover & {
        dateOfManufacture: string | number;
      };
      const givenCsv = `a,b,c,color\n1,henry,135000,red\n2,henrietta,155000,pink\n3,clive,135000,red`;
      const givenRenamingMap = new Map([
        ["a", "id"],
        ["b", "name"],
        ["c", "suction"],
      ]);
      const givenInferences: Array<
        Inference<RawHoover, { dateOfManufacture: string }>
      > = [
        {
          field: "dateOfManufacture",
          rules: [
            {
              given: { name: "henry", color: "red" },
              inferValue: "2023-01-29T15:55:55.186Z",
            },
          ],
          defaultValue: "2023-01-01T15:55:55.186Z",
        },
      ];
      const givenTransformations: Transformations<
        AugmentedHoover,
        { timestampOfManufacture: number }
      > = [
        {
          inputKey: "dateOfManufacture",
          outputKey: "timestampOfManufacture",
          condition: /\d+-\d+-\d+T\d+:\d+:\d+.\d+Z/,
          operations: [
            {
              operation: Operations.construct,
              parameter: Constructables.date,
            },
            {
              operation: Operations.multiply,
              parameter: 0.001,
            },
            {
              operation: Operations.floor,
            },
          ],
        },
      ];
      const result = await orchestrate<
        AugmentedHoover,
        { dateOfManufacture: string; timestampOfManufacture: number }
      >(givenCsv, {
        renamingMap: givenRenamingMap,
        inferences: givenInferences,
        transformations: givenTransformations,
      });
      expect(result).toEqual([
        {
          id: "1",
          name: "henry",
          suction: "135000",
          color: "red",
          dateOfManufacture: "2023-01-29T15:55:55.186Z",
          timestampOfManufacture: 1675007755,
        },
        {
          id: "2",
          name: "henrietta",
          suction: "155000",
          color: "pink",
          dateOfManufacture: "2023-01-01T15:55:55.186Z",
          timestampOfManufacture: 1672588555,
        },
        {
          id: "3",
          name: "clive",
          suction: "135000",
          color: "red",
          dateOfManufacture: "2023-01-01T15:55:55.186Z",
          timestampOfManufacture: 1672588555,
        },
      ]);
    });
  });
});
