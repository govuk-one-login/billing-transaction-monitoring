import { BusinessLogic } from "../../handler-context";
import { formatDate } from "../../shared/utils";
import { CleanedEventBody } from "../store-transactions/types";
import { ConfigCache, Env } from "./types";

export const businessLogic: BusinessLogic<
  CleanedEventBody,
  Env,
  ConfigCache,
  string
> = ({ event_id, timestamp }) => {
  const date = new Date(timestamp);
  const key = `${formatDate(date, "/")}/${event_id}.json`;

  return [key];
};
