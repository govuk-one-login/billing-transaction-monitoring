import { ConfigElements } from "../handler-context";
import { makeCtxConfig } from "../handler-context/context-builder";
import { fetchS3 } from "../shared/utils";

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
          ?.vendor_name ?? "",
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
export const MONTHS = [
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

export const getContractPeriods = async (
  contractId: string
): Promise<Array<{ month: string; year: string; prettyMonth: string }>> => {
  const dashboardData = await getDashboardExtract();
  return dashboardData
    .filter((row) => row.contract_id === contractId)
    .map((row) => ({
      year: row.year,
      month: row.month,
      prettyMonth: MONTHS[Number(row.month) - 1],
    }))
    .filter(
      (row, i, rows) =>
        rows.findIndex((r) => r.prettyMonth === row.prettyMonth) === i
    ) // removes duplicates
    .sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month;
      } else {
        return a.year - b.year;
      }
    });
};

export const getLineItems = async (
  contractId: string,
  year: string,
  month: string
): Promise<any[]> => {
  const dashboardData = await getDashboardExtract();
  return dashboardData.filter(
    (row) =>
      row.contract_id === contractId && row.year === year && row.month === month
  );
};

export const getDashboardExtract = async (): Promise<any[]> => {
  if (process.env.STORAGE_BUCKET === undefined)
    throw new Error("No STORAGE_BUCKET defined in this environment");

  const extract = await fetchS3(
    process.env.STORAGE_BUCKET,
    "btm_extract_data/full-extract.json"
  );

  const jsonArray = "[" + extract.replace(/\n/g, ",") + "]";
  return JSON.parse(jsonArray);
};
