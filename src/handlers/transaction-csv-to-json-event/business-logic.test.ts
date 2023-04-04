import { Logger } from "@aws-lambda-powertools/logger";
import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { Operations, Constructables } from "./convert/transform-dicts";
import { ConfigFiles, Env } from "./types";

describe("transaction-csv-to-json-events businessLogic", () => {
  it("processes CSVs which can be processed and provide warnings about those that can't", async () => {
    const logger = new Logger();
    const spiedOnWarn = jest.spyOn(logger, "warn");

    const result = await businessLogic({
      messages: [
        "Invalid CSV",
        "a,color,timestamp\none,red,1667262461\ntwo,pink,1667262461",
        "Invalid CSV",
      ],
      config: {
        renamingMap: [["a", "id"]],
        inferences: [
          {
            field: "event_name",
            rules: [
              { given: { id: "one", color: "red" }, inferValue: "TEST_EVENT" },
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
      logger,
    } as unknown as HandlerCtx<string, Env, ConfigFiles>);

    expect(result).toEqual([
      {
        id: "one",
        color: "red",
        timestamp: 1667262461,
        event_name: "TEST_EVENT",
      },
    ]);

    expect(spiedOnWarn).toHaveBeenCalledWith(
      expect.stringMatching("2 event conversions failed")
    );

    expect(spiedOnWarn).toHaveBeenCalledWith(
      expect.stringMatching("1 event names could not be determined")
    );
  });
});
