import { getS3Object } from "../helpers/s3Helper";
import csvtojson from "csvtojson";

export type RateConfigRows = RateConfigRow[];

export const getRatesFromConfig = async (
  configBucket: string
): Promise<RateConfigRows> => {
  const RatesConfigText = await getS3Object({
    bucket: configBucket,
    key: "rate_tables/rates.csv",
  });

  if (RatesConfigText === "" || RatesConfigText === undefined) {
    throw new Error("No rates config found");
  }
  const csvConverter = csvtojson();
  const ratesConfig = await csvConverter.fromString(RatesConfigText);
  return ratesConfig;
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
