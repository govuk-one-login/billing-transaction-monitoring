import { PageParamsGetter, PageTitleGetter, contractsPage } from "../pages";
import { getOverviewRows, OverviewRow } from "../extract-helpers";
import { getLinkData } from "../utils";

export type HomeParams = {
  overviewRows: OverviewRow[];
};

export const homeParamsGetter: PageParamsGetter<{}, HomeParams> = async (
  request
) => {
  const [contractsLinkData, overviewRows] = await Promise.all([
    getLinkData(contractsPage, request.params),
    getOverviewRows(),
  ]);

  return { contractsLinkData, overviewRows };
};

export const homeTitleGetter: PageTitleGetter<{}> = async () =>
  "Billings and reconciliation";
