import { getS3Object } from "../helpers/s3Helper";
import csvtojson from "csvtojson";

export type ContractsConfigRows = ContractsConfigRow[];

let contractRowsPromise: Promise<string | undefined>;

export const getContractsFromConfig = async (
  configBucket: string
): Promise<ContractsConfigRows> => {
  if (contractRowsPromise === undefined) {
    contractRowsPromise = getS3Object({
      bucket: configBucket,
      key: "contracts/contracts.csv",
    });
  }
  const contractConfigText = await contractRowsPromise;
  if (contractConfigText === "" || contractConfigText === undefined) {
    throw new Error("No contract config found");
  }
  const csvConverter = csvtojson();
  return await csvConverter.fromString(contractConfigText);
};

export interface ContractsConfigRow {
  id: string;
  name: string;
  vendor_id: string;
}
