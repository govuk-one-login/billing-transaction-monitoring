import { getUrl, invoicePage, invoicesPage } from "../pages";
import { LinkData } from "../utils";
import { getContractPeriods } from "./get-contract-periods";
import { getContracts } from "./get-contracts";
import { getInvoiceStatus } from "./get-invoice-status";
import { getLineItems } from "./get-line-items";

export interface OverviewRow {
  contractLinkData: LinkData;
  vendorName: string;
  year: string;
  prettyMonth: string;
  reconciliationDetails: {
    bannerText: string;
    bannerClass: string;
  };
  invoiceLinkData: LinkData;
}

export const getOverviewRows = async (): Promise<OverviewRow[]> => {
  const overviewRows: OverviewRow[] = [];

  const contracts = await getContracts();
  for (const contract of contracts) {
    const latestMonth = await getRecentMonth(contract.id);
    if (latestMonth) {
      const reconciliationDetails = await getReconciliationDetails(
        contract.id,
        latestMonth.year,
        latestMonth.month
      );
      const row = {
        contractLinkData: {
          href: getUrl(invoicesPage, { contract_id: contract.id }),
          text: contract.name,
        },
        vendorName: contract.vendorName,
        year: latestMonth.year,
        prettyMonth: latestMonth.prettyMonth,
        reconciliationDetails,
        invoiceLinkData: {
          href: getUrl(invoicePage, {
            contract_id: contract.id,
            month: latestMonth.month,
            year: latestMonth.year,
          }),
          text: "View Invoice",
        },
      };
      overviewRows.push(row);
    }
  }
  return overviewRows;
};

const getRecentMonth = async (
  contractId: string
): Promise<{ month: string; year: string; prettyMonth: string }> => {
  const contractPeriods = await getContractPeriods(contractId);
  return contractPeriods[contractPeriods.length - 1];
};

const getReconciliationDetails = async (
  contractId: string,
  year: string,
  month: string
): Promise<{
  bannerText: string;
  bannerClass: string;
}> => {
  const lineItems = await getLineItems(contractId, year, month);
  return getInvoiceStatus(lineItems);
};
