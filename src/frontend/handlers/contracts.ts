import { getContracts } from "../extract-helpers";
import { ContractParams, PageParamsGetter } from "../pages";

export const contractsParamsGetter: PageParamsGetter<
  {},
  ContractParams
> = async (_) => {
  return {
    pageTitle: "Contracts",
    contracts: await getContracts(),
  };
};
