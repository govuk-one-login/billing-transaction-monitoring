import { PageParamsGetter, PageTitleGetter } from "../pages";

export type ErrorPageParams = {};

export const errorParamsGetter: PageParamsGetter<{}, ErrorPageParams> = async (
  _
) => ({});

export const errorTitleGetter: PageTitleGetter<{}> = async () =>
  "Sorry, there is a problem with the service";
