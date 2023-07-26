import { ErrorPageParams, PageParamsGetter, PageTitleGetter } from "../pages";
import { pageTitleFormatter } from "../utils";

export const errorParamsGetter: PageParamsGetter<{}, ErrorPageParams> = async (
  _
) => {
  const pageTitle = await errorTitleGetter();

  return {
    headTitle: pageTitleFormatter(pageTitle),
    pageTitle,
  };
};

export const errorTitleGetter: PageTitleGetter<{}> = async () =>
  "Sorry, there is a problem with the service";
