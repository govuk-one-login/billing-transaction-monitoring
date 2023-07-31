import { PageParamsGetter, PageTitleGetter } from "../pages";

export type CookiesParams = {};

export const cookiesParamsGetter: PageParamsGetter<{}, CookiesParams> = async (
  _
) => ({});

export const cookiesTitleGetter: PageTitleGetter<{}> = async () => "Cookies";
