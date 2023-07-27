import { getContractIds } from "../extract-helpers";
import {
  ContractParams,
  PageParamsGetter,
  PageTitleGetter,
  invoicesPage,
  cookiesPage,
} from "../pages";
import { getLinkData } from "../utils";

export const contractsParamsGetter: PageParamsGetter<
  {},
  ContractParams
> = async (request) => {
  const [pageTitle, cookiesLink, contractIds] = await Promise.all([
    contractsTitleGetter(),
    getLinkData(cookiesPage, request.params),
    getContractIds(),
  ]);

  const invoicesLinkDataPromises = contractIds.map(
    async (id) =>
      await getLinkData(invoicesPage, { ...request.params, contract_id: id })
  );

  return {
    pageTitle,
    cookiesLink,
    invoicesLinksData: await Promise.all(invoicesLinkDataPromises),
  };
};

export const contractsTitleGetter: PageTitleGetter<{}> = async () =>
  "Contracts";
