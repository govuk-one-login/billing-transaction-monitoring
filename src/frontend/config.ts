import { ConfigElements } from "../handler-context";
import { makeCtxConfig } from "../handler-context/context-builder";
import { AthenaQueryExecutor } from "../shared/utils/athenaV3";
import { AthenaClient } from "@aws-sdk/client-athena";

// TODO Figure out caching
export const getContracts = async (): Promise<
  Array<{
    name: string;
    contract_id: string;
  }>
> => {
  const config = await makeCtxConfig([
    ConfigElements.services,
    ConfigElements.contracts,
  ]);
  return config.contracts.map((contract) => {
    return {
      name: `${contract.name} - ${
        config.services.find((svc) => svc.vendor_id === contract.vendor_id)
          ?.vendor_name
      }`,
      contract_id: contract.id,
    };
  });
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

const athena = new AthenaClient({ region: "eu-west-2" });

const QUERY_WAIT = 30 * 1000; // Thirty seconds

// Write getContractData which will return the display name and all the months/years
export const getContractData = async (
  contractName: string
): Promise<Array<{ month: string; year: string }>> => {
  if (process.env.QUERY_RESULTS_BUCKET === undefined)
    throw new Error("No QUERY_RESULTS_BUCKET defined in this environment");

  console.log("contract name", contractName);

  const fetchDataSql = `SELECT year, month FROM "${process.env.DATABASE_NAME}".btm_monthly_extract WHERE contract_name='${contractName}'`;
  const executor = new AthenaQueryExecutor(athena, QUERY_WAIT);
  const results = await executor.fetchResults(
    fetchDataSql,
    process.env.QUERY_RESULTS_BUCKET
  );
  if (results.Rows === undefined) {
    throw new Error("No results in result set");
  }

  console.log(results.Rows);

  const outputRows = new Array<{ month: string; year: string }>();
  // const outputRows = results.Rows
  //   .slice(1)
  //   .map((row) => {
  //     return {
  //       month: row[0],
  //       year: row[1]
  //     }
  //   });
  return outputRows;
};
