import { businessLogic, ConfigFiles, Env } from "./handler";
import { Constructables, Operations } from "./convert/transform-dicts";
import { __setConfigOverrides } from "../../handler-context/config/__mocks__";
import { InferenceSpecifications } from "./convert/make-inferences";
import { Transformations } from "./convert/perform-transformations";
import { HandlerCtx } from "../../handler-context";
import { Logger } from "@aws-lambda-powertools/logger";

jest.mock("../../shared/utils");

const renamingMap: [[string, string]] = [["a", "id"]];
const inferences: InferenceSpecifications<{}, { event_name: string }> = [
  {
    field: "event_name",
    rules: [{ given: { id: "one", color: "red" }, inferValue: "TEST_EVENT" }],
    defaultValue: "Unknown",
  },
];
const transformations: Transformations<
  { timestamp: string },
  { timestamp: number }
> = [
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
];

describe("transaction-csv-to-json-events businessLogic", () => {
  it("processes CSVs which can be processed and provide warnings about those that can't", async () => {
    const logger = new Logger();
    const spiedOnWarn = jest.spyOn(logger, "warn");

    const events = await businessLogic({
      messages: [
        "Invalid CSV",
        "a,color,timestamp\none,red,1667262461\ntwo,pink,1667262461",
        "Invalid CSV",
      ],
      config: {
        renamingMap,
        inferences,
        transformations: transformations as Transformations<{}, {}>,
      },
      logger,
    } as unknown as HandlerCtx<string, Env, ConfigFiles>);

    expect(events).toEqual([
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
