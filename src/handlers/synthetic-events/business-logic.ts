import { HandlerCtx } from "../../handler-context";
import { Env } from "./types";
import { ConfigElements } from "../../shared/constants";
import { ConfigSyntheticEventsRow } from "../../shared/types";
import { CleanedEventBody } from "../clean/types";

export const businessLogic = async (
  _: unknown,
  { config }: HandlerCtx<Env, any, any>
): Promise<CleanedEventBody[]> => {
  const syntheticEventsConfig = config[
    ConfigElements.services
  ] as ConfigSyntheticEventsRow[];

  const now = Date.now();
  const events: CleanedEventBody[] = [];
  for (const configLine of syntheticEventsConfig) {
    if (
      configLine.startDate.getUTCDate() < now &&
      (!configLine.endDate || configLine.endDate.getUTCDate() > now)
    ) {
      const event: CleanedEventBody = {
        vendor_id: configLine.vendorId,
        event_id: crypto.randomUUID(),
        event_name: configLine.eventName,
        timestamp: now,
        timestamp_formatted: now.toLocaleString("en-gb"),
        credits: configLine.quantity,
        component_id: configLine.componentId,
      };
      events.push(event);
    }
  }
  return events;
};
