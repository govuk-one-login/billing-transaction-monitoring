import { getUrl, Page } from "../pages";

export type LinkData = {
  text: string;
  href: string;
};

export const getLinkData = async <TParams extends Record<string, string>>(
  page: Page<TParams, unknown>,
  requestParams: TParams
): Promise<LinkData> => ({
  text: await page.titleGetter(requestParams),
  href: getUrl(page, requestParams),
});
