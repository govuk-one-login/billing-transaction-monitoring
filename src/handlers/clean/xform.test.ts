import { XformConfig, Combinators, Comparitors, xform } from "./xform";

describe("xform", () => {
  it("Combines multiple comparisons", () => {
    const xformConfig: XformConfig = {
      field: "credits",
      default: 1,
      logic: {
        value: 2,
        combinator: Combinators.OR,
        conditions: [
          {
            // No value implies return raw bool
            combinator: Combinators.AND,
            conditions: [
              {
                path: "$..sorted_rate",
                comparitor: Comparitors.NEQ,
                comparisonValue: "Not available",
              },
              {
                path: "$..sorted_rate",
                comparitor: Comparitors.EXISTS,
              },
            ],
          },
          {
            path: "$.timestamp",
            comparitor: Comparitors.LT,
            comparisonValue: 0,
          },
        ],
      },
    };

    const singleCreditEvent = {
      component_id: "oidc.integration.account.gov.uk",
      event_id: "b3492dc3-6568-4731-8600-a8c8ffe22fc4",
      event_name: "AUTH_PHONE_CHECK_COMPLETE",
      extensions: {
        evidence: [
          {
            sorted_rate: "Not available",
          },
        ],
      },
      timestamp: 1675070604,
      timestamp_formatted: "2023-01-30T09:23:24.000Z",
      user: {},
    };

    const doubleCreditEventWithSortedRate = {
      component_id: "oidc.integration.account.gov.uk",
      event_id: "b3492dc3-6568-4731-8600-a8c8ffe22fc4",
      event_name: "AUTH_PHONE_CHECK_COMPLETE",
      extensions: {
        evidence: [
          {
            sorted_rate: 1684328453597,
          },
        ],
        iss: "oidc.integration.account.gov.uk",
      },
      timestamp: 1675070604,
      timestamp_formatted: "2023-01-30T09:23:24.000Z",
      user: {},
    };

    const doubleCreditEventFromTheSixties = {
      component_id: "oidc.integration.account.gov.uk",
      event_id: "b3492dc3-6568-4731-8600-a8c8ffe22fc4",
      event_name: "AUTH_PHONE_CHECK_COMPLETE",
      extensions: {
        evidence: [],
        iss: "oidc.integration.account.gov.uk",
      },
      timestamp: -100_000_000_000,
      timestamp_formatted: "1966-10-31T14:13:20.000Z",
      user: {},
    };

    expect(
      xform<{ credits: number }>(singleCreditEvent, xformConfig).credits
    ).toEqual(1);
    expect(
      xform<{ credits: number }>(doubleCreditEventWithSortedRate, xformConfig)
        .credits
    ).toEqual(2);
    expect(
      xform<{ credits: number }>(doubleCreditEventFromTheSixties, xformConfig)
        .credits
    ).toEqual(2);
  });

  describe("Depth 1 comparisons", () => {
    interface Car {
      brand: string;
      seats: number;
      seatbelts: number;
      topSpeed: number;
    }

    describe("Equality", () => {
      // A safe distance between cars is one meter per mph
      // BMW owners disagree.
      // This configuration discerns the distance between
      // a given car and the car in front based on the
      // brand of the given car.

      type AugmentedCar = Car & {
        interVehicularDistance: number;
      };

      const interVehicularDistanceConfig: XformConfig = {
        field: "interVehicularDistance",
        default: 70,
        logic: {
          value: 1,
          path: "$.brand",
          comparitor: Comparitors.EQ,
          comparisonValue: "BMW",
        },
      };
      it("Applies the specified inter-vehicular distance to matching cars", () => {
        expect(
          xform<AugmentedCar>({ brand: "BMW" }, interVehicularDistanceConfig)
            .interVehicularDistance
        ).toBe(1);
      });

      it("Applies the default inter-vehicular distance to non-matching cars", () => {
        expect(
          xform<AugmentedCar>({ brand: "Ford" }, interVehicularDistanceConfig)
            .interVehicularDistance
        ).toBe(70);
      });
    });

    describe("Inequality", () => {
      // Cars that are not Ferraris are also not red.
      // This config makes all non Ferraris blue.

      type AugmentedCar = Car & {
        color: number;
      };

      const interVehicularDistanceConfig: XformConfig = {
        field: "color",
        default: "red",
        logic: {
          value: "blue",
          path: "$.brand",
          comparitor: Comparitors.NEQ,
          comparisonValue: "Ferrari",
        },
      };
      it("Makes non-Ferraris blue", () => {
        expect(
          xform<AugmentedCar>({ brand: "Nissan" }, interVehicularDistanceConfig)
            .color
        ).toBe("blue");
      });

      it("Makes Ferraris red", () => {
        expect(
          xform<AugmentedCar>(
            { brand: "Ferrari" },
            interVehicularDistanceConfig
          ).color
        ).toBe("red");
      });
    });

    describe("Greater than", () => {
      // Fast cars have go faster stripes, that's what
      // makes them fast.
      // This configuration discerns whether or not a
      // given car has go faster stripes based on it's
      // top speed.

      type AugmentedCar = Car & {
        hasGoFasterStripes: boolean;
      };

      const goFasterStripesConfig: XformConfig = {
        field: "hasGoFasterStripes",
        default: false,
        logic: {
          path: "$.topSpeed",
          comparitor: Comparitors.GT,
          comparisonValue: 155,
        },
      };

      it("Sets go faster stripes to true on matching cars", () => {
        expect(
          xform<AugmentedCar>({ topSpeed: 200 }, goFasterStripesConfig)
            .hasGoFasterStripes
        ).toBe(true);
      });

      it("Sets go faster stripes to false on non-matching cars", () => {
        expect(
          xform<AugmentedCar>({ topSpeed: 100 }, goFasterStripesConfig)
            .hasGoFasterStripes
        ).toBe(false);
      });
    });

    describe("Less than", () => {
      // Cars with low quantities of seats also
      // have low numbers of doors.
      // This configuration asserts that cars
      // with less than three seats have just
      // three doors.

      type AugmentedCar = Car & {
        doors: number;
      };

      const doorsConfig: XformConfig = {
        field: "doors",
        default: 5,
        logic: {
          value: 3,
          path: "$.seats",
          comparitor: Comparitors.LT,
          comparisonValue: 3,
        },
      };

      it("Sets doors to 3 for cars with less than 3 seats", () => {
        expect(xform<AugmentedCar>({ seats: 2 }, doorsConfig).doors).toBe(3);
      });

      it("Sets doors to 5 for cars with more than 2 seats", () => {
        expect(xform<AugmentedCar>({ seats: 12 }, doorsConfig).doors).toBe(5);
      });
    });

    describe("Existence", () => {
      // Not all cars have seatbelts
      // therefore not all car objects have
      // seatbelt fields.
      // If a car doesn't have seatbelts
      // then it's a certified death trap

      type AugmentedCar = Car & {
        isDeathTrap: boolean;
      };

      const doorsConfig: XformConfig = {
        field: "isDeathTrap",
        default: true,
        logic: {
          value: false,
          path: "$.seatbelts",
          comparitor: Comparitors.EXISTS,
        },
      };

      it("Declares cars without seatbelts to be death traps", () => {
        expect(xform<AugmentedCar>({}, doorsConfig).isDeathTrap).toBe(true);
      });

      it("Certifies cars with seatbelts as non-death traps", () => {
        expect(
          xform<AugmentedCar>({ seatbelts: 5 }, doorsConfig).isDeathTrap
        ).toBe(false);
      });
    });
  });

  describe("Depth 1 combinations", () => {
    describe("Equality and equality", () => {
      const xformConfig: XformConfig = {
        field: "c",
        default: false,
        logic: {
          combinator: Combinators.AND,
          conditions: [
            {
              path: "$.a",
              comparitor: Comparitors.EQ,
              comparisonValue: "a",
            },
            {
              path: "$.b",
              comparitor: Comparitors.EQ,
              comparisonValue: "b",
            },
          ],
        },
      };

      it("sets c to true on matching objects", () => {
        const result = xform({ a: "a", b: "b" }, xformConfig);
        expect(result).toEqual({ a: "a", b: "b", c: true });
      });
      it("sets c to false on non-matching objects", () => {
        expect(xform({ a: "d", b: "b" }, xformConfig)).toEqual({
          a: "d",
          b: "b",
          c: false,
        });
        expect(xform({ a: "a", b: "d" }, xformConfig)).toEqual({
          a: "a",
          b: "d",
          c: false,
        });
      });
    });

    describe("Equality or equality", () => {
      const xformConfig: XformConfig = {
        field: "c",
        default: false,
        logic: {
          combinator: Combinators.OR,
          conditions: [
            {
              path: "$.a",
              comparitor: Comparitors.EQ,
              comparisonValue: "a",
            },
            {
              path: "$.b",
              comparitor: Comparitors.EQ,
              comparisonValue: "b",
            },
          ],
        },
      };

      it("sets c to true on matching objects", () => {
        expect(xform({ a: "a", b: "b" }, xformConfig)).toEqual({
          a: "a",
          b: "b",
          c: true,
        });
        expect(xform({ a: "a", b: "d" }, xformConfig)).toEqual({
          a: "a",
          b: "d",
          c: true,
        });
        expect(xform({ a: "d", b: "b" }, xformConfig)).toEqual({
          a: "d",
          b: "b",
          c: true,
        });
      });

      it("sets c to false on non-matching objects", () => {
        expect(xform({ a: "d", b: "d" }, xformConfig)).toEqual({
          a: "d",
          b: "d",
          c: false,
        });
      });
    });
  });
});
