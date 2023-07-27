import {
  cookiesPage,
  ErrorPageParams,
  PageParamsGetter,
  PageTitleGetter,
} from "../pages";
import { getLinkData, pageTitleFormatter } from "../utils";

export const errorParamsGetter: PageParamsGetter<{}, ErrorPageParams> = async (
  request
) => {
  const [pageTitle, cookiesLink] = await Promise.all([
    errorTitleGetter(),
    getLinkData(cookiesPage, request.params),
  ]);

  return {
    pageTitle,
    cookiesLink,
    headTitle: pageTitleFormatter(pageTitle),
  };
};

export const errorTitleGetter: PageTitleGetter<{}> = async () =>
  "Sorry, there is a problem with the service";
