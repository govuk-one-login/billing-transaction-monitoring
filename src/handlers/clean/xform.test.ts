import { XformConfig, Combinators, Comparitors, xform } from "./xform";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const singleCreditEvent = {
  component_id: "oidc.integration.account.gov.uk",
  event_id: "b3492dc3-6568-4731-8600-a8c8ffe22fc4",
  event_name: "AUTH_PHONE_CHECK_COMPLETE",
  extensions: {
    evidence: [
      {
        ported_date: "Not available",
      },
    ],
  },
  timestamp: 1675070604,
  timestamp_formatted: "2023-01-30T09:23:24.000Z",
  user: {},
};

const doubleCreditEvent = {
  component_id: "oidc.integration.account.gov.uk",
  event_id: "b3492dc3-6568-4731-8600-a8c8ffe22fc4",
  event_name: "AUTH_PHONE_CHECK_COMPLETE",
  extensions: {
    evidence: [
      {
        ported_date: 1684328453597,
      },
    ],
    iss: "oidc.integration.account.gov.uk",
  },
  timestamp: 1675070604,
  timestamp_formatted: "2023-01-30T09:23:24.000Z",
  user: {},
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const xformConfig2: XformConfig = {
  field: "that",
  default: "there",
  logic: {
    value: "where?",
    path: "$.this",
    comparitor: Comparitors.EQ,
    comparisonValue: "here",
  },
};

describe("xform", () => {
  it("does things to stuff for reasons", () => {
    expect(
      xform<{ credits: number }>(singleCreditEvent, xformConfig).credits
    ).toEqual(1);
    expect(
      xform<{ credits: number }>(doubleCreditEvent, xformConfig).credits
    ).toEqual(2);
  });

  describe("Depth 1 comparisons", () => {
    interface Car {
      brand: string;
      color: string;
      hasGoFasterStripes: boolean;
    }

    describe("Equality", () => {
      type CarWithInterVehicularDistance = Car & {
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
          xform<CarWithInterVehicularDistance>(
            { brand: "BMW" },
            interVehicularDistanceConfig
          ).interVehicularDistance
        ).toBe(1);
      });

      it("Applies the default inter-vehicular distance to non-matching cars", () => {
        expect(
          xform<CarWithInterVehicularDistance>(
            { brand: "Ford" },
            interVehicularDistanceConfig
          ).interVehicularDistance
        ).toBe(70);
      });
    });

    describe("Less than", () => {});
  });
});
