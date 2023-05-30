import { getS3Object } from "../helpers/s3Helper";
import csvtojson from "csvtojson";
import { RATE_TABLE_CONFIG_PATH } from "../test-constants";

export type RateConfigRows = RateConfigRow[];

let ratesRowsPromise: Promise<string | undefined>;

export const getRatesFromConfig = async (
  configBucket: string
): Promise<RateConfigRows> => {
  if (ratesRowsPromise === undefined) {
    ratesRowsPromise = getS3Object({
      bucket: configBucket,
      key: RATE_TABLE_CONFIG_PATH,
    });
  }
  const ratesConfigText = await ratesRowsPromise;
  if (ratesConfigText === "" || ratesConfigText === undefined) {
    throw new Error("No rates config found");
  }
  const csvConverter = csvtojson();
  return await csvConverter.fromString(ratesConfigText);
};

export interface RateConfigRow {
  vendor_id: string;
  event_name: string;
  volumes_from: number;
  volumes_to: number;
  unit_price: number;
  effective_from: string;
  effective_to: string;
}
