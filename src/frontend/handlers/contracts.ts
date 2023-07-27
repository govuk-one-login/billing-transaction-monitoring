import { getContractIds } from "../extract-helpers";
import {
  PageParamsGetter,
  PageTitleGetter,
  invoicesPage,
  cookiesPage,
  BaseParams,
} from "../pages";
import { getLinkData, LinkData } from "../utils";

export type ContractParams = BaseParams & {
  invoicesLinksData: LinkData[];
};

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
