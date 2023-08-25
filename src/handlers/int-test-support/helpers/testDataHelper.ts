import { configStackName } from "./envHelper";
import { EventPayload } from "./payloadHelper";
import { getRatesFromConfig } from "../config-utils/get-rate-config-rows";
import { getVendorServiceConfigRows } from "../config-utils/get-vendor-service-config-rows";
import { getE2ETestConfig } from "../config-utils/get-e2e-test-config";
import { checkS3BucketForEventId } from "./commonHelpers";
import { sendMessageToQueue, Queue } from "./sqsHelper";

const configBucket = configStackName();

export const getNonQuarterlyInvoiceVendorServiceAndRatesFromConfig =
  async (): Promise<TestDataRetrievedFromConfig> => {
    const [vendorServiceRows, rateConfigRows] = await Promise.all([
      getVendorServiceConfigRows(configBucket, {
        invoice_is_quarterly: "false",
      }),
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

    if (
      configBucket.includes("staging") ||
      configBucket.includes("integration")
    ) {
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

export const getQuarterlyInvoiceVendorServiceAndRatesFromConfig =
  async (): Promise<TestDataRetrievedFromConfig | undefined> => {
    const [vendorServiceRows, rateConfigRows] = await Promise.all([
      getVendorServiceConfigRows(configBucket, {
        invoice_is_quarterly: "true",
      }),
      getRatesFromConfig(configBucket),
    ]);

    const vendorServiceRow = vendorServiceRows[0];

    if (vendorServiceRow === undefined) return undefined;

    const vendorId = vendorServiceRow.vendor_id;

    const quarterlyRateConfigRow = rateConfigRows.find(
      ({ vendor_id }) => vendor_id === vendorId
    );

    if (quarterlyRateConfigRow === undefined) return undefined;

    return {
      unitPrice: quarterlyRateConfigRow.unit_price,
      vendorId,
      vendorName: vendorServiceRow.vendor_name,
      eventName: vendorServiceRow.event_name,
      serviceName: vendorServiceRow.service_name,
      description: vendorServiceRow.service_name,
    };
  };

export interface GenerateEventsResult {
  success: boolean;
  eventId?: string;
}

export const sendEventAndVerifyInDataStore = async (
  eventPayload: EventPayload,
  queue: Queue
): Promise<GenerateEventsResult> => {
  try {
    await sendMessageToQueue({ queue, message: JSON.stringify(eventPayload) });
    const eventId = eventPayload.event_id;
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
  invoiceDate: string;
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
  invoiceIsQuarterly?: boolean;
}
