import { configStackName } from "../../src/handlers/int-test-support/helpers/envHelper";
import { getVendorServiceConfigRows } from "../../src/handlers/int-test-support/config-utils/get-vendor-service-config-rows";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";

const configBucket = configStackName();

describe("\n Execute athena query to retrieve vendor service details\n", () => {
  test("retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ", async () => {
    const queryString = `SELECT * FROM "btm_vendor_service_standardised"`;
    const queryResult = await queryAthena(queryString);
    const queryResultToString = JSON.stringify(queryResult);
    const queryJsonObj = JSON.parse(queryResultToString);
    const csvData = await getVendorServiceConfigRows(configBucket, {});
    expect(csvData).toEqual(queryJsonObj);
  });
});
