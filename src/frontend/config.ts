import { ConfigElements } from "../handler-context";
import { makeCtxConfig } from "../handler-context/context-builder";
import { AthenaQueryExecutor } from "../shared/utils/athenaV3";
import { AthenaClient, Datum } from "@aws-sdk/client-athena";

// TODO Figure out caching
export const getContracts = async (): Promise<
  Array<{
    id: string;
    name: string;
    vendorName: string;
  }>
> => {
  const config = await makeCtxConfig([
    ConfigElements.services,
    ConfigElements.contracts,
  ]);

  return config.contracts.map((contract) => {
    return {
      id: contract.id,
      name: contract.name,
      vendorName:
        config.services.find((svc) => svc.vendor_id === contract.vendor_id)
          ?.vendor_name || "",
    };
  });
};

export const getContractAndVendorName = async (
  contractId: string
): Promise<{ vendorName: string; contractName: string }> => {
  const config = await makeCtxConfig([
    ConfigElements.services,
    ConfigElements.contracts,
  ]);

  const contract = config.contracts.find(
    (contract) => contract.id === contractId
  );

  if (contract === undefined) {
    throw new Error("No contract found");
  }

  const vendorName =
    config.services.find((svc) => svc.vendor_id === contract.vendor_id)
      ?.vendor_name ?? "";

  return { vendorName, contractName: contract.name };
};

export const getContractPrettyName = async (id: string): Promise<string> => {
  const config = await makeCtxConfig([
    ConfigElements.services,
    ConfigElements.contracts,
  ]);
  const contract = config.contracts.find((contract) => contract.id === id);
  if (contract === undefined) {
    throw new Error("No contract found");
  }
  return `${contract.name} - ${
    config.services.find((svc) => svc.vendor_id === contract.vendor_id)
      ?.vendor_name
  }`;
};

export const getContractName = async (id: string): Promise<string> => {
  const config = await makeCtxConfig([
    ConfigElements.services,
    ConfigElements.contracts,
  ]);
  const contract = config.contracts.find((contract) => contract.id === id);
  if (contract === undefined) {
    throw new Error("No contract found");
  }
  return contract.name;
};

const isCompleteDatum = (datum: Datum): datum is { VarCharValue: string } =>
  !!datum.VarCharValue;

const isCompleteDataArray = (
  data: Datum[] | undefined
): data is Array<{ VarCharValue: string }> =>
  !!data?.every((datum) => datum !== undefined && isCompleteDatum(datum));

const athena = new AthenaClient({ region: "eu-west-2" });

const QUERY_WAIT = 250; // 0.25 second

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Write getContractData which will return the display name and all the months/years
export const getContractPeriods = async (
  contractName: string
): Promise<Array<{ month: string; year: string; prettyMonth: string }>> => {
  if (process.env.QUERY_RESULTS_BUCKET === undefined)
    throw new Error("No QUERY_RESULTS_BUCKET defined in this environment");

  const fetchDataSql = `SELECT DISTINCT month, year FROM "${process.env.DATABASE_NAME}".btm_monthly_extract WHERE contract_name LIKE '${contractName}' ORDER BY year DESC, month DESC`;
  const executor = new AthenaQueryExecutor(athena, QUERY_WAIT);
  const results = await executor.fetchResults(
    fetchDataSql,
    process.env.QUERY_RESULTS_BUCKET
  );
  if (results.Rows === undefined) {
    throw new Error("No results in result set");
  }

  return results.Rows.slice(1).map(({ Data }) => {
    const isDataComplete = isCompleteDataArray(Data);
    if (!isDataComplete) throw new Error("Some data was missing");

    return {
      month: Data[0].VarCharValue,
      prettyMonth: months[Number(Data[0].VarCharValue) - 1],
      year: Data[1].VarCharValue,
    };
  });
};
