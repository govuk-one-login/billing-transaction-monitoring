/* import { ContractConfigRow, getContractsFromConfig } from '../../src/handlers/int-test-support/config-utils/get-contract-config-rows';



export const getVendorContractId = async(vendor:string,configBucket:string): Promise<number> => {
const contracts:ContractConfigRow[]= await getContractsFromConfig(configBucket)

const contractWithVendor = contracts.find((contract) => contract.name === vendor)
if(!contractWithVendor) {
    throw new Error(`Contract not found for vendor: ${vendor}`)
}
const vendorContractId = Number(contractWithVendor.vendor_id)
return vendorContractId
  }; */
