import { VendorServiceConfigRow } from "../../../shared/utils/config-utils/fetch-vendor-service-config";
import { configStackName, resourcePrefix } from "./envHelper";
import { getS3Object, listS3Objects } from "./s3Helper";
import csvtojson from "csvtojson";
import { invokeLambda } from "./lambdaHelper";
import { updateSQSEventPayloadBody } from "./payloadHelper";
import { getVendorServiceConfigRows } from "../../../shared/utils";
import { poll } from "./commonHelpers";

let vendorServiceDetails: VendorServiceConfigRow[] = [];
const configBucket = configStackName();
let rateConfigRows: RateConfigRow[] = [];

const convertRatesCSVtoJSON = async (): Promise<RateConfigRow[]> => {
  const ratesCsv = await getS3Object({
    bucket: configBucket,
    key: "rate_tables/rates.csv",
  });
  rateConfigRows = await csvtojson().fromString(ratesCsv ?? "");
  return rateConfigRows;
};

const getServiceDescriptionFromConfig = async (): Promise<string> => {
  const response = await getS3Object({
    bucket: configBucket,
    key: "e2e-test.json",
  });
  const serviceDescription = JSON.parse(response ?? "");
  return serviceDescription.parser_0_service_description;
};

export const getVendorServiceAndRatesFromConfig =
  async (): Promise<TestDataRetrievedFromConfig> => {
    vendorServiceDetails = await getVendorServiceConfigRows(configBucket, {});
    rateConfigRows = await convertRatesCSVtoJSON();
    const testDataRetrievedFromConfig = {
      unitPrice: rateConfigRows[2].unit_price,
      vendorId: vendorServiceDetails[1].vendor_id,
      vendorName: vendorServiceDetails[1].vendor_name,
      eventName: vendorServiceDetails[1].event_name,
      serviceName: vendorServiceDetails[1].service_name,
      description: vendorServiceDetails[1].service_name,
    };

    if (configBucket.includes("staging" || "integration")) {
      await getServiceDescriptionFromConfig().then((result) => {
        testDataRetrievedFromConfig.description = result;
      });
      testDataRetrievedFromConfig.unitPrice = rateConfigRows[0].unit_price;
      testDataRetrievedFromConfig.vendorId = vendorServiceDetails[0].vendor_id;
      testDataRetrievedFromConfig.vendorName =
        vendorServiceDetails[0].vendor_name;
      testDataRetrievedFromConfig.eventName =
        vendorServiceDetails[0].event_name;
      testDataRetrievedFromConfig.serviceName =
        vendorServiceDetails[0].service_name;
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

export interface RateConfigRow {
  vendor_id: string;
  event_name: string;
  volumes_from: number;
  volumes_to: number;
  unit_price: number;
  effective_from: string;
  effective_to: string;
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
