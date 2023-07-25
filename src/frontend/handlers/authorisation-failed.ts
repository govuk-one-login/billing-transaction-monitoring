import {
  AuthorisationFailedParams,
  PageParamsGetter,
  PageTitleGetter,
} from "../pages";

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
