import {
  HomeParams,
  PageParamsGetter,
  PageTitleGetter,
  contractsPage,
} from "../pages";
import { getOverviewRows } from "../extract-helpers/get-overview-rows";
import { getLinkData } from "../utils";

export const homeParamsGetter: PageParamsGetter<{}, HomeParams> = async (
  request
) => {
  const [contractsLinkData, overviewRows, pageTitle] = await Promise.all([
    getLinkData(contractsPage, request.params),
    getOverviewRows(),
    homeTitleGetter(),
  ]);

  return { contractsLinkData, pageTitle, overviewRows };
};

export const homeTitleGetter: PageTitleGetter<{}> = async () =>
  "Billings and reconciliation";
