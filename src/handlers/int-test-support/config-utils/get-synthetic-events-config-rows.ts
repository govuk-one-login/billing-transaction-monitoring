import { configStackName } from "../helpers/envHelper";
import { getS3Object } from "../helpers/s3Helper";

const configBucket = configStackName();

let syntheticEventsRowsPromise: Promise<string | undefined>;

export const getSyntheticEventsConfig = async (): Promise<
  SyntheticEventsConfigRow[]
> => {
  if (syntheticEventsRowsPromise === undefined) {
    syntheticEventsRowsPromise = getS3Object({
      bucket: configBucket,
      key: "synthetic_events/synthetic-events.json",
    });
  }
  return JSON.parse((await syntheticEventsRowsPromise) ?? "");
};

export interface SyntheticEventsConfigRow {
  vendor_id: string;
  event_name: string;
  quantity: number;
  start_date: number;
  frequency: number;
  component_id: string;
}
