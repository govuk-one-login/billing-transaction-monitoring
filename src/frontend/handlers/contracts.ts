import { getContractIds } from "../extract-helpers";
import {
  ContractParams,
  PageParamsGetter,
  PageTitleGetter,
  invoicesPage,
} from "../pages";
import { getLinkData } from "../utils";

export const contractsParamsGetter: PageParamsGetter<
  {},
  ContractParams
> = async (request) => {
  const [contractIds, pageTitle] = await Promise.all([
    getContractIds(),
    contractsTitleGetter(),
  ]);

  const invoicesLinkDataPromises = contractIds.map(
    async (id) =>
      await getLinkData(invoicesPage, { ...request.params, contract_id: id })
  );

  return {
    invoicesLinksData: await Promise.all(invoicesLinkDataPromises),
    pageTitle,
  };
};

export const contractsTitleGetter: PageTitleGetter<{}> = async () =>
  "Contracts";
