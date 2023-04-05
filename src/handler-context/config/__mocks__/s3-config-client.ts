import { ConfigFileNames } from "../types";

export const getConfigFile = jest.fn(async (path) => {
  switch (path) {
    case ConfigFileNames.inferences:
      return "mock inferences";
    case ConfigFileNames.rates:
      return "mock rates";
    case ConfigFileNames.standardisation:
      return "mock standardisation";
    default:
      throw new Error("No config found");
  }
});
