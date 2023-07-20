import { PageParamsGetter } from "../pages";
// import { getOverviewRows } from "../extract-helpers/get-overview-rows";

export const indexParamsGetter: PageParamsGetter<{}, {}> = async (_) => {
  return {
    pageTitle: "Billings and reconciliation",
    // overviewRows: await getOverviewRows(),
  };
};
