import { IndexParams, PageParamsGetter, PageTitleGetter } from "../pages";
import { getOverviewRows } from "../extract-helpers/get-overview-rows";

export const indexParamsGetter: PageParamsGetter<{}, IndexParams> = async (
  _
) => {
  const [pageTitle, overviewRows] = await Promise.all([
    indexTitleGetter(),
    getOverviewRows(),
  ]);

  return {
    pageTitle,
    overviewRows,
  };
};

export const indexTitleGetter: PageTitleGetter<{}> = async () =>
  "Billings and reconciliation";
