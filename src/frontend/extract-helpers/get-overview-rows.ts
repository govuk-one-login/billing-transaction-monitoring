import { getMonthQuarter } from "../../shared/utils";
import { getUrl, invoicePage, invoicesPage } from "../pages";
import { InvoiceBannerStatus, LinkData, statusLabels } from "../utils";
import { Period, getContractPeriods } from "./get-contract-periods";
import { getContracts } from "./get-contracts";
import { getInvoiceBanner } from "./get-invoice-banner";
import { getLineItems } from "./get-line-items";

export interface OverviewRow {
  contractLinkData: LinkData;
  vendorName: string;
  year: string;
  prettyMonthOrQuarter: string;
  reconciliationDetails: {
    bannerMessage: string;
    tagClass: string;
  };
  invoiceLinkData: LinkData;
}

export const getOverviewRows = async (): Promise<OverviewRow[]> => {
  const overviewRows: OverviewRow[] = [];

  const contracts = await getContracts();
  for (const contract of contracts) {
    const latestPeriod = await getRecentPeriod(contract.id);
    if (latestPeriod) {
      const reconciliationDetails = await getReconciliationDetails(
        contract.id,
        latestPeriod.year,
        latestPeriod.month,
        latestPeriod.isQuarter
      );
      const row = {
        contractLinkData: {
          href: getUrl(invoicesPage, { contract_id: contract.id }),
          text: contract.name,
        },
        vendorName: contract.vendorName,
        year: latestPeriod.year,
        prettyMonthOrQuarter: latestPeriod.isQuarter
          ? getMonthQuarter(latestPeriod.month)
          : latestPeriod.prettyMonth,
        reconciliationDetails,
        invoiceLinkData: {
          href: getUrl(invoicePage, {
            contract_id: contract.id,
            monthOrQuarter: latestPeriod.isQuarter
              ? getMonthQuarter(latestPeriod.month).toLowerCase()
              : latestPeriod.month,
            year: latestPeriod.year,
          }),
          text: "View Invoice",
        },
      };
      overviewRows.push(row);
    }
  }
  return overviewRows;
};

const getRecentPeriod = async (contractId: string): Promise<Period> => {
  const contractPeriods = await getContractPeriods(contractId);
  return contractPeriods[contractPeriods.length - 1];
};

const getReconciliationDetails = async (
  contractId: string,
  year: string,
  month: string,
  invoiceIsQuarterly?: boolean
): Promise<{
  bannerMessage: string;
  tagClass: string;
}> => {
  let tagClass;
  const lineItems = await getLineItems(
    contractId,
    year,
    month,
    invoiceIsQuarterly
  );
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
