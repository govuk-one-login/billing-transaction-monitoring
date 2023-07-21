import { getContracts } from "../extract-helpers";
import { ContractParams, PageParamsGetter, PageTitleGetter } from "../pages";

export const contractsParamsGetter: PageParamsGetter<
  {},
  ContractParams
> = async (_) => {
  return {
    pageTitle: await contractsTitleGetter(),
    contracts: await getContracts(),
  };
};

export const contractsTitleGetter: PageTitleGetter<{}> = async () =>
  "Contracts";
