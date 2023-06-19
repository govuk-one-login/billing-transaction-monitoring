import { getS3Object } from "../helpers/s3Helper";
import csvtojson from "csvtojson";

export type ContractsConfigRow = ContractsConfigRow[];

let contractRowsPromise: Promise<string | undefined>;

export const getContractsFromConfig = async (
  configBucket: string
): Promise<ContractsConfigRow> => {
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

export interface ContractConfigRow {
  id: string;
  name: string;
  vendor_id: string;
}
