import { IndexParams, PageParamsGetter } from "../pages";
import { getOverviewRows } from "../extract-helpers/get-overview-rows";

export const indexParamsGetter: PageParamsGetter<{}, IndexParams> = async (
  _
) => {
  return {
    pageTitle: "Billings and reconciliation",

    overviewRows: await getOverviewRows(),
  };
};
