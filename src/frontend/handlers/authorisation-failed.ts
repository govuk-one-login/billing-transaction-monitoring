import { PageParamsGetter, PageTitleGetter } from "../pages";

export type AuthorisationFailedParams = {
  pageTitle: string;
};

export const authorisationFailedParamsGetter: PageParamsGetter<
  {},
  AuthorisationFailedParams
> = async (_) => {
  return {
    pageTitle: await authorisationFailedTitleGetter(),
  };
};

export const authorisationFailedTitleGetter: PageTitleGetter<{}> = async () =>
  "Authorisation failed";
