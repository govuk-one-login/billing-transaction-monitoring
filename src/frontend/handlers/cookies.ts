import {
  BasePage,
  cookiesPage,
  PageParamsGetter,
  PageTitleGetter,
} from "../pages";
import { getLinkData } from "../utils";

export type CookiesParams = BasePage & {};

export const cookiesParamsGetter: PageParamsGetter<{}, CookiesParams> = async (
  request
) => {
  const pageTitle = "Change your cookie settings";

  const cookiesLink = await getLinkData(cookiesPage, request.params);

  return { pageTitle, cookiesLink };
};

export const cookiesTitleGetter: PageTitleGetter<{}> = async () => "Cookies";
