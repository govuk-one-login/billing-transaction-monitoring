import { ConfigElements } from "../types";

export const getConfigFile = jest.fn(async (path) => {
  switch (path) {
    case ConfigElements.inferences:
      return "mock inferences";
    case ConfigElements.rates:
      return "mock rates";
    case ConfigElements.standardisation:
      return "mock standardisation";
    default:
      throw new Error("No config found");
  }
});
