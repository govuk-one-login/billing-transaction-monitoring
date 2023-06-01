// using a type here because interface won't be interpreted
// as an extension of Record<string, unknown>

import { InferenceSpecifications, makeInferences } from "./make-inferences";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type RawHoover = {
  id: string;
  name: string;
  suction: string;
  color: string;
};

describe("infer", () => {
  describe("given an array of objects and a set of rules", () => {
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
      const givenInferences: InferenceSpecifications<
        RawHoover,
        { eyelashLength: number; isOriginal: boolean }
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

      const result = makeInferences<
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

  describe("given a request to infer something about a field that already exists", () => {
    it("does not destroy the information in that field", () => {
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
          color: "pink",
        } as unknown as RawHoover,
      ];

      const givenInferences: InferenceSpecifications<
        RawHoover,
        { suction: number }
      > = [
        {
          field: "suction",
          rules: [
            {
              given: { name: "henrietta", suction: "155000" },
              inferValue: true,
            },
          ],
          defaultValue: "125000",
        },
      ];

      const result = makeInferences<RawHoover, { suction: number }>(
        givenArray,
        givenInferences
      );

      expect(result).toEqual([
        {
          id: "1",
          name: "henry",
          suction: "135000",
          color: "red",
        },
        {
          id: "2",
          name: "henrietta",
          suction: "125000",
          color: "pink",
        },
      ]);
    });
  });
});
