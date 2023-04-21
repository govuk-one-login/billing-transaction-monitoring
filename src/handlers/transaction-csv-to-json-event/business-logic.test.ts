import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { Operations, Constructables } from "./convert/transform-dicts";

describe("transaction-csv-to-json-events businessLogic", () => {
  let givenCtx: HandlerCtx<any, any>;
  let givenWarningLogger: jest.Mock;

  beforeEach(() => {
    givenWarningLogger = jest.fn();

    givenCtx = {
      config: {
        renamingMap: [["a", "id"]],
        inferences: [
          {
            field: "event_name",
            rules: [
              {
                given: { id: "one", color: "red" },
                inferValue: "TEST_EVENT",
              },
            ],
            defaultValue: "Unknown",
          },
        ],
        transformations: [
          {
            inputKey: "timestamp",
            outputKey: "timestamp",
            condition: "^\\d{10}$",
            steps: [
              {
                operation: Operations.construct,
                parameter: Constructables.number,
              },
            ],
          },
        ],
      },
      logger: { warn: givenWarningLogger },
    } as any;
  });

  describe("CSV which can be processsed", () => {
    it("processes CSV and provides warning for line which can't be processed", async () => {
      const result = await businessLogic(
        "a,color,timestamp\none,red,1667262461\ntwo,pink,1667262461",
        givenCtx
      );

      expect(result).toEqual([
        {
          id: "one",
          color: "red",
          timestamp: 1667262461,
          event_name: "TEST_EVENT",
        },
      ]);

      expect(givenWarningLogger).toHaveBeenCalledWith(
        expect.stringMatching("1 event names could not be determined")
      );
    });
  });

  describe("CSV which can't be processed", () => {
    it("throws error", async () => {
      const resultPromise = businessLogic("Invalid CSV", givenCtx);
      await expect(resultPromise).rejects.toThrow();
    });
  });
});
