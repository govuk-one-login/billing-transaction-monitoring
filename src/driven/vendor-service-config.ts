import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { VENDOR_SERVICE_CONFIG_PATH } from "../shared/constants";
import {
  isVendorServiceConfigRow,
  VendorServiceConfig,
  VendorServiceConfigRow,
} from "../shared/utils/config-utils/fetch-vendor-service-config";
import getCsvConverter from "csvtojson";
import { VendorServiceConfigRows } from "../shared/utils";

export class VendorServiceConfigStore {
  private readonly _client: S3Client;
  private readonly _config: Promise<VendorServiceConfig>;

  constructor(client: S3Client) {
    this._client = client;
    this._config = this._fetchConfig();
  }

  private readonly _fetchConfig = async (): Promise<VendorServiceConfig> => {
    if (process.env.CONFIG_BUCKET === undefined)
      throw new Error("No CONFIG_BUCKET defined in this environment");
    const response = await this._client.send(
      new GetObjectCommand({
        Bucket: process.env.CONFIG_BUCKET,
        Key: VENDOR_SERVICE_CONFIG_PATH,
      })
    );
    const configString = await response.Body?.transformToString();
    if (configString === undefined)
      throw new Error(`Vendor service config not found`);
    const csvConverter = getCsvConverter();
    const config = await csvConverter.fromString(configString);
    if (!config.every(isVendorServiceConfigRow))
      throw new Error("Invalid vendor service config");

    return config;
  };

  public getVendorIdByEventName = async (
    eventName: string
  ): Promise<string> => {
    const vendorId = (await this._config).find(
      (vendor) => vendor.event_name === eventName
    );

    if (vendorId === undefined) {
      throw new Error(
        "Event name: " + eventName + " not found in vendorServiceConfig"
      );
    }
    return vendorId.vendor_id;
  };

  public getVendorServiceConfigRows = async (
    fields: Partial<VendorServiceConfigRow>
  ): Promise<VendorServiceConfigRows> => {
    const vendorServiceConfigRows = (await this._config).filter((row) =>
      Object.entries(fields).every(
        ([fieldName, fieldValue]) =>
          fieldValue === undefined ||
          row[fieldName as keyof VendorServiceConfigRow] === fieldValue
      )
    );

    if (!vendorServiceConfigRows.length)
      throw new Error("No vendor service config rows found");

    return vendorServiceConfigRows;
  };
}
