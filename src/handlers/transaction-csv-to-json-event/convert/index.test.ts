import { convert } from ".";
import { InferenceSpecifications } from "./make-inferences";
import { Transformations } from "./perform-transformations";
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

describe("convert", () => {
  describe("given an array of objects, a map to rename the header row,  a set of rules and operations to transform", () => {
    it("renames, infers additional details and transforms specified fields about the objects", async () => {
      type AugmentedHoover = RawHoover & {
        dateOfManufacture: string | number;
      };
      const givenCsv = `a,b,c,color\n1,henry,135000,red\n2,henrietta,155000,pink\n3,clive,135000,red`;
      const givenRenamingConfig: Array<[string, string]> = [
        ["a", "id"],
        ["b", "name"],
        ["c", "suction"],
      ];
      const givenInferences: InferenceSpecifications<
        RawHoover,
        { dateOfManufacture: string }
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
      const result = await convert<
        AugmentedHoover,
        { dateOfManufacture: string; timestampOfManufacture: number }
      >(givenCsv, {
        renamingMap: givenRenamingConfig,
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
