import { configStackName, resourcePrefix } from "./envHelper";
import { invokeLambda } from "./lambdaHelper";
import {
  EventPayload,
  updateSQSEventPayloadBody,
  CleanedEventPayload,
} from "./payloadHelper";
import { getRatesFromConfig } from "../config-utils/get-rate-config-rows";
import { getVendorServiceConfigRows } from "../config-utils/get-vendor-service-config-rows";
import { getE2ETestConfig } from "../config-utils/get-e2e-test-config";
import { checkS3BucketForEventId } from "./commonHelpers";

const configBucket = configStackName();

export const getVendorServiceAndRatesFromConfig =
  async (): Promise<TestDataRetrievedFromConfig> => {
    const [vendorServiceRows, rateConfigRows] = await Promise.all([
      getVendorServiceConfigRows(configBucket, {}),
      getRatesFromConfig(configBucket),
    ]);
    const testDataRetrievedFromConfig = {
      unitPrice: rateConfigRows[2].unit_price,
      vendorId: vendorServiceRows[1].vendor_id,
      vendorName: vendorServiceRows[1].vendor_name,
      eventName: vendorServiceRows[1].event_name,
      serviceName: vendorServiceRows[1].service_name,
      description: vendorServiceRows[1].service_name,
    };

    if (configBucket.includes("staging" || "integration")) {
      await getE2ETestConfig().then((result) => {
        testDataRetrievedFromConfig.description =
          result.parser_0_service_description;
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

export interface GenerateEventsResult {
  success: boolean;
  eventId?: string;
}

export const invokeFilterLambdaAndVerifyEventInS3Bucket = async (
  payload: EventPayload
): Promise<GenerateEventsResult> => {
  const updatedSQSEventPayload = await updateSQSEventPayloadBody(
    payload,
    "../../../../integration_tests/payloads/validSQSEventPayload.json"
  );
  return await invokeLambdaAndVerifyEventInS3Bucket(
    updatedSQSEventPayload,
    `${resourcePrefix()}-filter-function`
  );
};

export const invokeCleanLambdaAndVerifyEventInS3Bucket = async (
  payload: EventPayload
): Promise<GenerateEventsResult> => {
  const updatedSQSEventPayload = await updateSQSEventPayloadBody(
    payload,
    "../../../../integration_tests/payloads/validSQSEventPayload.json"
  );
  return await invokeLambdaAndVerifyEventInS3Bucket(
    updatedSQSEventPayload,
    `${resourcePrefix()}-clean-function`
  );
};

export const invokeStorageLambdaAndVerifyEventInS3Bucket = async (
  payload: CleanedEventPayload
): Promise<GenerateEventsResult> => {
  const updatedSQSEventPayload = await updateSQSEventPayloadBody(
    payload,
    "../../../../integration_tests/payloads/validSQSStorageEventPayload.json"
  );
  console.log(`updatedSQSEventPayload=${updatedSQSEventPayload}`);
  return await invokeLambdaAndVerifyEventInS3Bucket(
    updatedSQSEventPayload,
    `${resourcePrefix()}-storage-function`
  );
};

const invokeLambdaAndVerifyEventInS3Bucket = async (
  updatedSQSEventPayload: string,
  functionName: string
): Promise<GenerateEventsResult> => {
  try {
    await invokeLambda({ functionName, payload: updatedSQSEventPayload });
    const json = JSON.parse(updatedSQSEventPayload);
    const eventId = JSON.parse(json.Records[0].body).event_id;
    const eventExistsInS3 = await checkS3BucketForEventId(eventId, 7000);
    if (!eventExistsInS3) {
      return { success: false, eventId };
    }
    return { success: true, eventId };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
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
  serviceName: string;
  priceDifferencePercentage: string;
  billingPriceFormatted: string;
  transactionPriceFormatted: string;
}
