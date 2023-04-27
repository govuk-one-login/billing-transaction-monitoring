import { BusinessLogic } from "../../handler-context";
import { CleanedEventBody } from "../store-transactions/types";
import { ConfigCache, Env } from "./types";

export const businessLogic: BusinessLogic<
  CleanedEventBody,
  Env,
  ConfigCache,
  CleanedEventBody
> = async (cleanedBody) => {
  return [cleanedBody];
};
