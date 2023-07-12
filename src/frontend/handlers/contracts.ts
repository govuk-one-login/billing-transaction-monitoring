import { getContracts } from "../config";
import { ContractParams, PageParamsGetter } from "../pages";

export const contractsParamsGetter: PageParamsGetter<
  {},
  ContractParams
> = async (_) => {
  return {
    contracts: await getContracts(),
  };
};
