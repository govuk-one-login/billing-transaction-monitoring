import {
  SyntheticEventFrequency,
  SyntheticEventType,
} from "../../shared/types";
import {
  getPeriodStart,
  nextPeriod,
  Period,
  periodIsBefore,
  periodsAreEqual,
} from "./period";

export function getActivePeriods(
  now: Date,
  frequency: SyntheticEventFrequency,
  type: SyntheticEventType,
  startDate: Date,
  endDate?: Date
): Period[] {
  const periods: Period[] = [];
  const isQuarterly = frequency === "quarterly";
  const nowPeriod = getPeriodStart(now, isQuarterly);
  const endPeriod = getPeriodStart(endDate ?? now, isQuarterly);
  let currentPeriod = getPeriodStart(startDate, isQuarterly);
  if (type === "fixed") {
    // Loop from the first period in the range through to the last, including the 'now' period but nothing
    // after that, as fixed events can be generated at any time within a period.
    while (
      !periodIsBefore(nowPeriod, currentPeriod) &&
      (periodIsBefore(currentPeriod, endPeriod) ||
        periodsAreEqual(currentPeriod, endPeriod))
    ) {
      periods.push(currentPeriod);
      currentPeriod = nextPeriod(currentPeriod);
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
      currentPeriod = nextPeriod(currentPeriod);
    }
  }
  return periods;
}
