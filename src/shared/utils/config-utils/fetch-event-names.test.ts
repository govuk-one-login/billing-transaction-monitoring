import { fetchEventNames } from "./fetch-event-names";

jest.mock("./get-config", () => ({
  getConfig: () => [
    { event_name: "BOUGHT_EGGS" },
    { event_name: "MADE_CAKE" },
    { event_name: "ATE_CAKE" },
    { event_name: "MADE_CAKE" },
    { event_name: "MADE_TEA" },
    { event_name: "ATE_CAKE" },
  ],
}));

describe("fetchEventNames", () => {
  it("returns a set of event names from the config bucket", async () => {
    const response = await fetchEventNames();
    expect(response).toEqual(
      new Set(["BOUGHT_EGGS", "MADE_CAKE", "MADE_TEA", "ATE_CAKE"])
    );
  });
});
