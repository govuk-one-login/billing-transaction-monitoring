import { configStackName, resourcePrefix } from "./envHelper";
import { listS3Objects } from "./s3Helper";
import { invokeLambda } from "./lambdaHelper";
import { updateSQSEventPayloadBody } from "./payloadHelper";
import { poll } from "./commonHelpers";
import { getRatesFromConfig } from "../config-utils/get-rate-config-rows";
import { getVendorServiceConfigRows } from "../config-utils/get-vendor-service-config-rows";
import { getServiceDescriptionFromE2ETestConfig } from "../config-utils/get-e2e-test-seviceDescription";

const configBucket = configStackName();

export const getVendorServiceAndRatesFromConfig =
  async (): Promise<TestDataRetrievedFromConfig> => {
    const vendorServiceRows = await getVendorServiceConfigRows(
      configBucket,
      {}
    );
    const rateConfigRows = await getRatesFromConfig(configBucket);
    const testDataRetrievedFromConfig = {
      unitPrice: rateConfigRows[2].unit_price,
      vendorId: vendorServiceRows[1].vendor_id,
      vendorName: vendorServiceRows[1].vendor_name,
      eventName: vendorServiceRows[1].event_name,
      serviceName: vendorServiceRows[1].service_name,
      description: vendorServiceRows[1].service_name,
    };

    if (configBucket.includes("staging" || "integration")) {
      await getServiceDescriptionFromE2ETestConfig().then((result) => {
        testDataRetrievedFromConfig.description = result;
      });
      testDataRetrievedFromConfig.unitPrice = rateConfigRows[0].unit_price;
      testDataRetrievedFromConfig.vendorId = vendorServiceRows[0].vendor_id;
      testDataRetrievedFromConfig.vendorName = vendorServiceRows[0].vendor_name;
      testDataRetrievedFromConfig.eventName = vendorServiceRows[0].event_name;
      testDataRetrievedFromConfig.serviceName =
        vendorServiceRows[0].service_name;
    }
    return testDataRetrievedFromConfig;
  };

export const generateTransactionEventsViaFilterLambda = async (
  eventTime: string,
  transactionQty: number,
  eventName: string
): Promise<string[]> => {
  const eventIds: string[] = [];
  for (let i = 0; i < transactionQty; i++) {
    const updatedSQSEventPayload = await updateSQSEventPayloadBody(
      eventTime,
      eventName
    );
    const functionName = `${resourcePrefix()}-filter-function`;
    await invokeLambda({ functionName, payload: updatedSQSEventPayload });
    const json = JSON.parse(updatedSQSEventPayload);
    const eventId = JSON.parse(json.Records[0].body).event_id;
    await poll(
      async () =>
        await listS3Objects({
          bucketName: `${resourcePrefix()}-storage`,
          prefix: `btm_transactions`,
        }),
      (result) => !!result?.Contents?.some((data) => data.Key?.match(eventId)),
      {
        nonCompleteErrorMessage:
          "event id not appeared in s3 within the given timeout",
      }
    );
    eventIds.push(eventId);
  }
  return eventIds;
};

export interface TestDataRetrievedFromConfig {
  description: string;
  unitPrice: number;
  vendorId: string;
  vendorName: string;
  eventName: string;
  serviceName: string;
}

export interface TestData {
  eventTime: string;
  numberOfTestEvents: number;
  billingQty: number;
  transactionQty: number;
  description: string;
  unitPrice: number;
  vendorId: string;
  vendorName: string;
  priceDiff: string;
  qtyDiff: string;
  priceDifferencePercent: string;
  qtyDifferencePercent: string;
  billingPrice: string;
  transactionPrice: string;
  serviceName: string;
}
