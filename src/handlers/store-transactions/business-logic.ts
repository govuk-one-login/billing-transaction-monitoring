import { BusinessLogic } from "../../handler-context";
import { CleanedEventBody } from "../store-transactions/types";
import { Env } from "./types";

export const businessLogic: BusinessLogic<
  CleanedEventBody,
  Env,
  never,
  CleanedEventBody
> = async (event, { logger }) => {
  logger.info(`Storing event ${event.event_id}`);
  return [event];
};
