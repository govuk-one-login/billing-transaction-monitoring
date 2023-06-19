import { configStackName } from "../../src/handlers/int-test-support/helpers/envHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { getContractsFromConfig } from "../../src/handlers/int-test-support/config-utils/get-contract-config-rows";

const configBucket = configStackName();

describe("\n Execute athena query to retrieve contract details details\n", () => {
  test("retrieved contract details should match with contract csv uploaded in s3 config bucket ", async () => {
    const queryString = `SELECT * FROM "btm_contracts_standardised"`;
    const queryResult = await queryAthena(queryString);
    const csvData = await getContractsFromConfig(configBucket);
    expect(csvData).toEqual(queryResult);
  });
});
