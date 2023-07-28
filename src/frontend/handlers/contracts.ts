import { getContractIds } from "../extract-helpers";
import { PageParamsGetter, PageTitleGetter, invoicesPage } from "../pages";
import { getLinkData, LinkData } from "../utils";

export type ContractParams = {
  invoicesLinksData: LinkData[];
};

export const contractsParamsGetter: PageParamsGetter<
  {},
  ContractParams
> = async (request) => {
  const contractIds = await getContractIds();

  const invoicesLinkDataPromises = contractIds.map(
    async (id) =>
      await getLinkData(invoicesPage, { ...request.params, contract_id: id })
  );

  return {
    invoicesLinksData: await Promise.all(invoicesLinkDataPromises),
  };
};

export const contractsTitleGetter: PageTitleGetter<{}> = async () =>
  "Contracts";
