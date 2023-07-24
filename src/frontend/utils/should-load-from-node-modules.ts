import { getFromEnv } from "../../shared/utils";

const nodeEnv = getFromEnv("NODE_ENV");

export const shouldLoadFromNodeModules =
  nodeEnv === "development" || nodeEnv === "test";
