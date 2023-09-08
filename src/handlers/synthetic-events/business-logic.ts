import { BusinessLogic } from "../../handler-context";
import { Env } from "./types";
import { ConfigElements } from "../../shared/constants";
import { ConfigSyntheticEventsRow } from "../../shared/types";
import { CleanedEventBody } from "../clean/types";
import crypto from "crypto";
import { formatDate } from "../../shared/utils";
import { getDashboardExtract } from "../../frontend/extract-helpers/get-dashboard-extract";
import { FullExtractLineItem } from "../../frontend/extract-helpers/types";

/**
 * Checks the synthetic events config, and generates events accordingly.
 *
 * There are currently two types of synthetic events loaded via config.  "Fixed" synthetic
 * events generate a fixed number of events every month, or quarter, and can be generated
 * as soon as we are inside that month or quarter.  "Shortfall" synthetic events generate
 * enough events to meet a target for a given month or quarter, and are generated only after
 * that month or quarter is ended.
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

  syntheticEventsConfig.forEach((configLine) => {
    const activePeriods = getActivePeriods(configLine, now);
    activePeriods.forEach((period) => {
      const existingEventCount = countExistingEvents(
        configLine,
        period,
        dashboardData
      );
      if (configLine.quantity > existingEventCount) {
        events.push(
          createEvent(
            new Date(period.year, period.month),
            configLine,
            configLine.quantity - existingEventCount
          )
        );
      }
    });
  });
  return events;
};

function countExistingEvents(
  configLine: ConfigSyntheticEventsRow,
  period: Period,
  dashboardData: FullExtractLineItem[]
): number {
  const eventTypes =
    configLine.type === "shortfall"
      ? [configLine.event_name, configLine.shortfall_event_name]
      : [configLine.event_name];

  return dashboardData
    .filter(
      (lineItem) =>
        lineItem.vendor_id === configLine.vendor_id &&
        eventTypes.includes(lineItem.event_name) &&
        +lineItem.year === period.year &&
        +lineItem.month - 1 === period.month
    )
    .map((lineItem) => +lineItem.transaction_quantity)
    .reduce<number>((sum, quantity) => sum + quantity, 0);
}

type Period = {
  month: number;
  year: number;
  isQuarterly: boolean;
};

function createEvent(
  time: Date,
  configLine: ConfigSyntheticEventsRow,
  credits: number
): CleanedEventBody {
  return {
    vendor_id: configLine.vendor_id,
    event_id: crypto.randomUUID(),
    event_name:
      configLine.type === "shortfall" && configLine.shortfall_event_name
        ? configLine.shortfall_event_name
        : configLine.event_name,
    timestamp: time.getTime(),
    timestamp_formatted: formatDate(time),
    credits,
    component_id: configLine.component_id,
  };
}

function getPeriodStart(date: Date, isQuarter: boolean): Period {
  return {
    year: date.getFullYear(),
    month: isQuarter ? Math.floor(date.getMonth() / 3) * 3 : date.getMonth(),
    isQuarterly: isQuarter,
  };
}

function periodIsBefore(period1: Period, period2: Period): boolean {
  return (
    period1.year < period2.year ||
    (period1.year === period2.year && period1.month < period2.month)
  );
}

function periodsAreEqual(period1: Period, period2: Period): boolean {
  return period1.year === period2.year && period1.month === period2.month;
}

function nextPeriod(period: Period, isQuarterly: boolean): Period {
  const newMonth = period.month + (isQuarterly ? 3 : 1);
  if (newMonth > 11) {
    return {
      month: newMonth - 12,
      year: period.year + 1,
      isQuarterly,
    };
  }
  return {
    month: newMonth,
    year: period.year,
    isQuarterly,
  };
}

function getActivePeriods(
  configLine: ConfigSyntheticEventsRow,
  now: Date
): Period[] {
  const periods: Period[] = [];
  const isQuarterly = configLine.frequency === "quarterly";
  const nowPeriod = getPeriodStart(now, isQuarterly);
  const endPeriod = getPeriodStart(
    configLine.end_date ? new Date(configLine.end_date) : now,
    isQuarterly
  );
  let currentPeriod = getPeriodStart(
    new Date(configLine.start_date),
    isQuarterly
  );
  if (configLine.type === "fixed") {
    // Loop from the first period in the range through to the last, including the 'now' period but nothing
    // after that, as fixed events can be generated at any time within a period.
    while (
      !periodIsBefore(nowPeriod, currentPeriod) &&
      (periodIsBefore(currentPeriod, endPeriod) ||
        periodsAreEqual(currentPeriod, endPeriod))
    ) {
      periods.push(currentPeriod);
      currentPeriod = nextPeriod(currentPeriod, isQuarterly);
    }
  } else {
    // Loop from the first period in the range through to the last, excluding the 'now' period and everything
    // after that, as shortfall events do not fire until after the current period is finished.
    while (
      !periodIsBefore(nowPeriod, currentPeriod) &&
      !periodsAreEqual(nowPeriod, currentPeriod) &&
      (periodIsBefore(currentPeriod, endPeriod) ||
        periodsAreEqual(currentPeriod, endPeriod))
    ) {
      periods.push(currentPeriod);
      currentPeriod = nextPeriod(currentPeriod, isQuarterly);
    }
  }
  return periods;
}
