import { PageParamsGetter, PageTitleGetter } from "../pages";

export type AuthorisationFailedParams = {};

export const authorisationFailedParamsGetter: PageParamsGetter<
  {},
  AuthorisationFailedParams
> = async (_) => ({});

export const authorisationFailedTitleGetter: PageTitleGetter<{}> = async () =>
  "Authorisation failed";
