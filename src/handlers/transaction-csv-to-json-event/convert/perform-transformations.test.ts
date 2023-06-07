import {
  performTransformations,
  Transformations,
} from "./perform-transformations";
import { Constructables, Operations } from "./transform-dicts";

// using a type here because interface won't be interpreted
// as an extension of Record<string, unknown>
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type RawHoover = {
  id: string;
  name: string;
  suction: string;
  color: string;
};

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
          condition: "\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z?",
          // These will be covered by the above condition [ "2023-03-05 08:00:07.82","2023-03-05 08:02:41.465","2023-03-02 09:43:19.5","2023-03-05 19:04:38","2022-11-01T00:27:41.186Z"]
          steps: [
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

      const result = performTransformations(givenArray, givenTransformations);

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
          condition: "^\\d{13}$",
          steps: [
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

      const result = performTransformations(givenArray, givenTransformations);

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
    it("performs the transformations of timestampOfManufacture from string to number when given timestampOfManufacture as seconds", () => {
      type AugmentedHoover = RawHoover & {
        eyelashLength: number;
        isOriginal: boolean;
        timestampOfManufacture: string | number;
      };
      const givenArray: AugmentedHoover[] = [
        {
          id: "5",
          name: "thelma",
          suction: "135000",
          color: "red",
          isOriginal: false,
          eyelashLength: 12,
          timestampOfManufacture: "1677601086",
        },
        {
          id: "6",
          name: "louise",
          suction: "145000",
          color: "blue",
          isOriginal: false,
          eyelashLength: 6,
          timestampOfManufacture: "1667262461",
        },
      ];

      const givenTransformations: Transformations<
        AugmentedHoover,
        { timestampOfManufacture: number }
      > = [
        {
          inputKey: "timestampOfManufacture",
          outputKey: "timestampOfManufacture",
          condition: "^\\d{10}$",
          steps: [
            {
              operation: Operations.construct,
              parameter: Constructables.number,
            },
          ],
        },
      ];

      const result = performTransformations(givenArray, givenTransformations);

      expect(result).toEqual([
        {
          id: "5",
          name: "thelma",
          suction: "135000",
          color: "red",
          isOriginal: false,
          eyelashLength: 12,
          timestampOfManufacture: 1677601086,
        },
        {
          id: "6",
          name: "louise",
          suction: "145000",
          color: "blue",
          isOriginal: false,
          eyelashLength: 6,
          timestampOfManufacture: 1667262461,
        },
      ]);
    });
  });
});
