import {
  BaseParams,
  cookiesPage,
  PageParamsGetter,
  PageTitleGetter,
} from "../pages";
import { getLinkData } from "../utils";

export type CookiesParams = BaseParams & {};

export const cookiesParamsGetter: PageParamsGetter<{}, CookiesParams> = async (
  request
) => {
  const [pageTitle, cookiesLink] = await Promise.all([
    cookiesTitleGetter(),
    getLinkData(cookiesPage, request.params),
  ]);

  return { pageTitle, cookiesLink };
};

export const cookiesTitleGetter: PageTitleGetter<{}> = async () => "Cookies";
