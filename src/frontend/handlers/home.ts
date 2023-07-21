import { IndexParams, PageParamsGetter, PageTitleGetter } from "../pages";
import { getOverviewRows } from "../extract-helpers/get-overview-rows";

export const indexParamsGetter: PageParamsGetter<{}, IndexParams> = async (
  _
) => {
  return {
    pageTitle: await indexTitleGetter(),
    overviewRows: await getOverviewRows(),
  };
};

export const indexTitleGetter: PageTitleGetter<{}> = async () =>
  "Billings and reconciliation";
