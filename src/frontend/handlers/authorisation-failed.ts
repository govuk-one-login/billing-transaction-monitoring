import { AuthorisationFailedParams, PageParamsGetter } from "../pages";

export const authorisationFailedParamsGetter: PageParamsGetter<
  {},
  AuthorisationFailedParams
> = async (_) => {
  return {
    pageTitle: "Authorisation failed",
  };
};
