import {
  BaseParams,
  cookiesPage,
  PageParamsGetter,
  PageTitleGetter,
} from "../pages";
import { getLinkData } from "../utils";

export type AuthorisationFailedParams = BaseParams & {
  pageTitle: string;
};

export const authorisationFailedParamsGetter: PageParamsGetter<
  {},
  AuthorisationFailedParams
> = async (request) => {
  const [pageTitle, cookiesLink] = await Promise.all([
    authorisationFailedTitleGetter(),
    getLinkData(cookiesPage, request.params),
  ]);
  return {
    pageTitle,
    cookiesLink,
  };
};

export const authorisationFailedTitleGetter: PageTitleGetter<{}> = async () =>
  "Authorisation failed";
