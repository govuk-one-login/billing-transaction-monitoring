import { getContractPeriods } from "./get-contract-periods";
import { getContracts } from "./get-contracts";

export interface OverviewRow {
  contractName: string;
  vendorName: string;
  month: string;
  reconciliationDetails: {
    message: string;
    class: string;
  };
  details: string;
}

export const getOverviewRows = async (): Promise<OverviewRow[]> => {
  const overviewRows = [];

  const contracts = await getContracts();

  for (const contract of contracts) {
    const latestPeriod = await getRecentMonth(contract.id);
    const row = {
      contractName: contract.name,
      vendorName: contract.vendorName,
      month: latestPeriod.prettyMonth + latestPeriod.year,
      // ToDo
      reconciliationDetails: {
        message: "Invoice Within Threshold",
        class: "govuk-tag--green",
      },
      details: "more details",
    };
    overviewRows.push(row);
  }
  return overviewRows;
};

const getRecentMonth = async (
  contractId: string
): Promise<{ month: string; year: string; prettyMonth: string }> => {
  const contractPeriods = await getContractPeriods(contractId);
  const latestPeriod = contractPeriods[contractPeriods.length - 1];
  return latestPeriod;
};

// const getReconciliationDetails = async (
//   contractId: string,
//   year: string,
//   month: string
// ): Promise<{
//   message: string;
//   class: string;
// }> => {
//   const lineItems = await getLineItems(contractId, year, month);
//   return getInvoiceBanner(lineItems);
// };
