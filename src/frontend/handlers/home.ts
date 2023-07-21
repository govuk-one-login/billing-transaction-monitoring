import {
  IndexParams,
  PageParamsGetter,
  PageTitleGetter,
  contractsPage,
} from "../pages";
import { getOverviewRows } from "../extract-helpers/get-overview-rows";
import { getLinkData } from "../utils";

export const indexParamsGetter: PageParamsGetter<{}, IndexParams> = async (
  request
) => {
  const [contractsLinkData, overviewRows, pageTitle] = await Promise.all([
    getLinkData(contractsPage, request.params),
    getOverviewRows(),
    indexTitleGetter(),
  ]);

  return { contractsLinkData, pageTitle, overviewRows };
};

export const indexTitleGetter: PageTitleGetter<{}> = async () =>
  "Billings and reconciliation";
