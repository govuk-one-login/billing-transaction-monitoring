import { BusinessLogic, HandlerCtx } from "../../handler-context";
import { Env } from "./types";
import { ConfigElements } from "../../shared/constants";
import { ConfigSyntheticEventsRow } from "../../shared/types";
import { CleanedEventBody } from "../clean/types";
import crypto from "crypto";
import { formatDate, isQuarter } from "../../shared/utils";
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
  any,
  Env,
  never,
  CleanedEventBody
> = async (_: unknown, { config }: HandlerCtx<Env, any, any>) => {
  const syntheticEventsConfig = config[
    ConfigElements.syntheticEvents
  ] as ConfigSyntheticEventsRow[];

  const dashboardData = await getDashboardExtract();

  // TYPE       FREQUENCY   KEY MONTH
  // fixed      monthly     current
  // fixed      quarterly   current qtr
  // shortfall  monthly     previous
  // shortfall  quarterly   previous qtr

  const now = new Date();
  const nowTime = now.getTime();
  const nowFormatted = formatDate(now);
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
            nowTime,
            nowFormatted,
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
  // const eventTypes =
  //   configLine.type === "shortfall"
  //     ? [configLine.event_name, configLine.shortfall_event_name]
  //     : [configLine.event_name];

  // TODO
  return 0;
  // return dashboardData.filter(
  //   (lineItem) => lineItem.vendor_id === configLine.vendor_id &&
  //     lineItem.
  // );
}

type Period = {
  month: number;
  year: number;
  isQuarterly: boolean;
};

function createEvent(
  nowTime: number,
  nowFormatted: string,
  configLine: ConfigSyntheticEventsRow,
  credits: number
): CleanedEventBody {
  return {
    vendor_id: configLine.vendor_id,
    event_id: crypto.randomUUID(),
    event_name: configLine.event_name,
    timestamp: nowTime,
    timestamp_formatted: nowFormatted,
    credits,
    component_id: configLine.component_id,
  };
}

function getPeriodStart(date: Date, isQuarter: boolean): Period {
  return {
    year: date.getFullYear(),
    month: isQuarter ? date.getMonth() : Math.ceil(date.getMonth() / 3) * 3,
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
  const lastPeriod = getPeriodStart(
    configLine.end_date ? new Date(configLine.end_date) : now,
    isQuarterly
  );
  let currentPeriod = getPeriodStart(
    new Date(configLine.start_date),
    isQuarterly
  );
  while (
    periodIsBefore(currentPeriod, lastPeriod) ||
    (configLine.type === "fixed" && periodsAreEqual(currentPeriod, lastPeriod))
  ) {
    periods.push(currentPeriod);
    currentPeriod = nextPeriod(currentPeriod, isQuarterly);
  }
  return periods;
}
