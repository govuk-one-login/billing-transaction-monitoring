import { InvoiceBannerStatus, statusLabels } from "../utils";
import { getContractPeriods } from "./get-contract-periods";
import { getContracts } from "./get-contracts";
import { getInvoiceBanner } from "./get-invoice-banner";
import { getLineItems } from "./get-line-items";

export interface OverviewRow {
  contractName: string;
  vendorName: string;
  month: string;
  reconciliationDetails: {
    bannerMessage: string;
    tagClass: string;
  };
  details: string;
}

export const getOverviewRows = async (): Promise<OverviewRow[]> => {
  const overviewRows = [];

  const contracts = await getContracts();
  for (const contract of contracts) {
    const latestMonth = await getRecentMonth(contract.id);
    const reconciliationDetails = await getReconciliationDetails(
      contract.id,
      latestMonth.year,
      latestMonth.month
    );
    const row = {
      contractName: contract.name,
      vendorName: contract.vendorName,
      month: latestMonth.prettyMonth + latestMonth.year,
      reconciliationDetails,
      details: "View Invoice",
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

const getReconciliationDetails = async (
  contractId: string,
  year: string,
  month: string
): Promise<{
  bannerMessage: string;
  tagClass: string;
}> => {
  let tagClass;
  const lineItems = await getLineItems(contractId, year, month);
  const bannerMessage = getInvoiceBanner(lineItems).status;
  if (bannerMessage === InvoiceBannerStatus.invoiceWithinThreshold) {
    tagClass = statusLabels.STATUS_LABEL_WITHIN_THRESHOLD.class;
  } else if (bannerMessage === InvoiceBannerStatus.invoiceAboveThreshold) {
    tagClass = statusLabels.STATUS_LABEL_ABOVE_THRESHOLD.class;
  } else if (bannerMessage === InvoiceBannerStatus.invoiceBelowThreshold) {
    tagClass = statusLabels.STATUS_LABEL_BELOW_THRESHOLD.class;
  } else {
    tagClass = statusLabels.STATUS_LABEL_PENDING.class;
  }
  return { bannerMessage, tagClass };
};
