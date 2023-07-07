import { getContracts } from "../config";
import { PageParamsGetter } from "../pages";

export const contractsParamsGetter: PageParamsGetter<any> = async (_) => {
  return {
    contracts: await getContracts(),
  };
};
