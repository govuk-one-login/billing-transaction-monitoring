import {
  HomeParams,
  PageParamsGetter,
  PageTitleGetter,
  contractsPage,
  cookiesPage,
} from "../pages";
import { getOverviewRows } from "../extract-helpers/get-overview-rows";
import { getLinkData } from "../utils";

export const homeParamsGetter: PageParamsGetter<{}, HomeParams> = async (
  request
) => {
  const [pageTitle, cookiesLink, contractsLinkData, overviewRows] =
    await Promise.all([
      homeTitleGetter(),
      getLinkData(cookiesPage, request.params),
      getLinkData(contractsPage, request.params),
      getOverviewRows(),
    ]);

  return { pageTitle, cookiesLink, contractsLinkData, overviewRows };
};

export const homeTitleGetter: PageTitleGetter<{}> = async () =>
  "Billings and reconciliation";
