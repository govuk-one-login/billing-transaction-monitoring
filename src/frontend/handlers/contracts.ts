import { getContracts } from "../extract-helpers";
import { ContractParams, PageParamsGetter, PageTitleGetter } from "../pages";

export const contractsParamsGetter: PageParamsGetter<
  {},
  ContractParams
> = async (_) => {
  const [pageTitle, contracts] = await Promise.all([
    contractsTitleGetter(),
    getContracts(),
  ]);
  return {
    pageTitle,
    contracts,
  };
};

export const contractsTitleGetter: PageTitleGetter<{}> = async () =>
  "Contracts";
