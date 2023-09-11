import { BusinessLogic } from "../../handler-context";
import { Env } from "./types";
import { ConfigElements } from "../../shared/constants";
import { SyntheticEventDefinition } from "../../shared/types";
import { CleanedEventBody } from "../clean/types";
import crypto from "crypto";
import { formatDate } from "../../shared/utils";
import { getDashboardExtract } from "../../frontend/extract-helpers/get-dashboard-extract";
import { FullExtractLineItem } from "../../frontend/extract-helpers/types";
import { getActivePeriods } from "./get-active-periods";
import { Period } from "./period";

/**
 * Checks the synthetic events config, and generates events accordingly.
 *
 * There are currently two types of synthetic events loaded via config.  "Fixed" synthetic
 * events generate a fixed number of events every month, or quarter, and can be generated
 * as soon as we are inside that month or quarter.  "Shortfall" synthetic events generate
 * enough events to meet a target for a given month or quarter, and are generated only after
 * that month or quarter is ended.  Shortfall events have a different event type than the
 * type they are padding out, since they appear as separate line items on invoices.
 *
 * A similar strategy will work for both types: for each month or quarter in a config
 * entry's active range, see if enough events have already been generated, and generate
 * new synthetic events if not.  For fixed events, the "active range" will include the
 * current month or quarter, whereas for shortfall events, it will not.  This will allow
 * for generating past events if new backdated config entries are added, and will make
 * this lambda tolerant of being called multiple times within a period (i.e. it will be
 * idempotent).
 */
export const businessLogic: BusinessLogic<
  {},
  Env,
  ConfigElements.syntheticEvents,
  CleanedEventBody
> = async (_, { config }) => {
  const syntheticEventsConfig = config[ConfigElements.syntheticEvents];

  const dashboardData = await getDashboardExtract();

  const now = new Date();
  const events: CleanedEventBody[] = [];

  syntheticEventsConfig.forEach((syntheticEventDefinition) => {
    const activePeriods = getActivePeriods(
      now,
      syntheticEventDefinition.frequency,
      syntheticEventDefinition.type,
      new Date(syntheticEventDefinition.start_date),
      syntheticEventDefinition.end_date
        ? new Date(syntheticEventDefinition.end_date)
        : undefined
    );
    activePeriods.forEach((period) => {
      const existingEventCount = countExistingEvents(
        syntheticEventDefinition,
        period,
        dashboardData
      );
      if (syntheticEventDefinition.quantity > existingEventCount) {
        events.push(
          createEvent(
            new Date(period.year, period.month),
            syntheticEventDefinition,
            syntheticEventDefinition.quantity - existingEventCount
          )
        );
      }
    });
  });
  return events;
};

function countExistingEvents(
  syntheticEventDefinition: SyntheticEventDefinition,
  period: Period,
  dashboardData: FullExtractLineItem[]
): number {
  const eventTypes =
    syntheticEventDefinition.type === "shortfall"
      ? [
          syntheticEventDefinition.event_name,
          syntheticEventDefinition.shortfall_event_name,
        ]
      : [syntheticEventDefinition.event_name];

  return dashboardData
    .filter(
      (lineItem) =>
        lineItem.vendor_id === syntheticEventDefinition.vendor_id &&
        eventTypes.includes(lineItem.event_name) &&
        +lineItem.year === period.year &&
        +lineItem.month - 1 === period.month
    )
    .map((lineItem) => +lineItem.transaction_quantity)
    .reduce<number>((sum, quantity) => sum + quantity, 0);
}

function createEvent(
  time: Date,
  syntheticEventDefinition: SyntheticEventDefinition,
  credits: number
): CleanedEventBody {
  return {
    vendor_id: syntheticEventDefinition.vendor_id,
    event_id: crypto.randomUUID(),
    event_name:
      syntheticEventDefinition.type === "shortfall" &&
      syntheticEventDefinition.shortfall_event_name
        ? syntheticEventDefinition.shortfall_event_name
        : syntheticEventDefinition.event_name,
    timestamp: time.getTime(),
    timestamp_formatted: formatDate(time),
    credits,
    component_id: syntheticEventDefinition.component_id,
  };
}
