import getCsvConverter from "csvtojson";
import { VENDOR_SERVICE_CONFIG_PATH } from "../../constants";
import { fetchS3 } from "../s3";
import { VendorServiceConfigRow } from "./fetch-vendor-service-config";
import {
  clearVendorServiceConfig,
  getVendorServiceConfigRow,
  setVendorServiceConfig,
} from "./get-vendor-service-config-row";

jest.mock("csvtojson");
const mockedGetCsvConverter = getCsvConverter as jest.Mock;

jest.mock("../s3");
const mockedFetchS3 = fetchS3 as jest.Mock;

const mockVendorServiceConfigRow = (
  fields: Partial<VendorServiceConfigRow>
): VendorServiceConfigRow => ({
  vendor_name: "mocked vendor name",
  vendor_regex: "mocked vendor regular expression",
  client_id: "mocked client ID",
  service_name: "mocked service name",
  service_regex: "mocked service regular expression",
  event_name: "mocked event name",
  ...fields,
});

describe("Vendor service config getter", () => {
  let mockedCsvConverter: any;
  let mockedCsvConverterFromString: jest.Mock;
  let mockedVendorName1: string;
  let mockedVendorName1ServiceConfigRow: VendorServiceConfigRow;
  let mockedVendorName2: string;
  let mockedVendorName2ServiceConfigRow: VendorServiceConfigRow;
  let mockedVendorServiceConfig: VendorServiceConfigRow[];
  let mockedVendorServiceConfigText: string;
  let givenConfigBucket: string;
  let givenFields: Partial<VendorServiceConfigRow>;

  beforeEach(() => {
    jest.resetAllMocks();
    clearVendorServiceConfig();

    mockedVendorServiceConfigText = "mocked vendor service config text";
    mockedFetchS3.mockReturnValue(mockedVendorServiceConfigText);

    mockedVendorName1 = "mocked vendor name 1";
    mockedVendorName1ServiceConfigRow = mockVendorServiceConfigRow({
      vendor_name: mockedVendorName1,
    });

    mockedVendorName2 = "mocked vendor name 2";
    mockedVendorName2ServiceConfigRow = mockVendorServiceConfigRow({
      vendor_name: mockedVendorName2,
    });

    mockedVendorServiceConfig = [
      mockedVendorName1ServiceConfigRow,
      mockedVendorName2ServiceConfigRow,
    ];

    mockedCsvConverterFromString = jest.fn(() => mockedVendorServiceConfig);
    mockedCsvConverter = { fromString: mockedCsvConverterFromString };
    mockedGetCsvConverter.mockReturnValue(mockedCsvConverter);

    givenConfigBucket = "given config bucket";
    givenFields = {};
  });

  test("Vendor service config getter with cached config", async () => {
    setVendorServiceConfig(mockedVendorServiceConfig);

    const result = await getVendorServiceConfigRow(
      givenConfigBucket,
      givenFields
    );

    expect(result).toEqual(mockedVendorServiceConfig[0]);
    expect(result).not.toBe(mockedVendorServiceConfig[0]);
    expect(mockedFetchS3).not.toHaveBeenCalled();
    expect(mockedGetCsvConverter).not.toHaveBeenCalled();
    expect(mockedCsvConverterFromString).not.toHaveBeenCalled();
  });

  test("Vendor service config getter with no cached config", async () => {
    const result = await getVendorServiceConfigRow(
      givenConfigBucket,
      givenFields
    );

    expect(result).toEqual(mockedVendorServiceConfig[0]);
    expect(result).not.toBe(mockedVendorServiceConfig[0]);
    expect(mockedFetchS3).toHaveBeenCalledTimes(1);
    expect(mockedFetchS3).toHaveBeenCalledWith(
      givenConfigBucket,
      VENDOR_SERVICE_CONFIG_PATH
    );
    expect(mockedGetCsvConverter).toHaveBeenCalledTimes(1);
    expect(mockedGetCsvConverter).toHaveBeenCalledWith();
    expect(mockedCsvConverterFromString).toHaveBeenCalledTimes(1);
    expect(mockedCsvConverterFromString).toHaveBeenCalledWith(
      mockedVendorServiceConfigText
    );
  });

  test("Vendor service config getter with no cached config and fetch error", async () => {
    const mockedFetchS3ErrorText = "mocked fetchS3 error text";
    mockedFetchS3.mockImplementation(() => {
      throw new Error(mockedFetchS3ErrorText);
    });

    await expect(
      getVendorServiceConfigRow(givenConfigBucket, givenFields)
    ).rejects.toThrowError(mockedFetchS3ErrorText);

    expect(mockedGetCsvConverter).not.toHaveBeenCalled();
    expect(mockedCsvConverterFromString).not.toHaveBeenCalled();
  });

  test("Vendor service config getter with no cached config and no vendor service config", async () => {
    mockedFetchS3.mockReturnValue(undefined);

    await expect(
      getVendorServiceConfigRow(givenConfigBucket, givenFields)
    ).rejects.toThrowError("No vendor service config found");

    expect(mockedGetCsvConverter).not.toHaveBeenCalled();
    expect(mockedCsvConverterFromString).not.toHaveBeenCalled();
  });

  test("Vendor service config getter with CSV converter error", async () => {
    const mockedCsvConverterErrorText = "mocked CSV converter error text";
    mockedCsvConverterFromString.mockImplementation(() => {
      throw new Error(mockedCsvConverterErrorText);
    });

    await expect(
      getVendorServiceConfigRow(givenConfigBucket, givenFields)
    ).rejects.toThrowError(mockedCsvConverterErrorText);
  });

  test("Vendor service config getter with invalid fetched config", async () => {
    mockedCsvConverterFromString.mockReturnValue([
      "mocked invalid fetched config",
    ]);

    await expect(
      getVendorServiceConfigRow(givenConfigBucket, givenFields)
    ).rejects.toThrowError("Invalid vendor service config");
  });

  test("Vendor service config getter with field not found", async () => {
    givenFields.vendor_name = "given vendor name with no vendor service config";

    await expect(
      getVendorServiceConfigRow(givenConfigBucket, givenFields)
    ).rejects.toThrowError("not found");
  });

  test("Vendor service config getter with field found", async () => {
    givenFields.vendor_name = mockedVendorName2;

    const result = await getVendorServiceConfigRow(
      givenConfigBucket,
      givenFields
    );

    expect(result).toEqual(mockedVendorName2ServiceConfigRow);
    expect(result).not.toBe(mockedVendorName2ServiceConfigRow);
  });

  test("Vendor service config getter called multiple times in parallel", async () => {
    mockedFetchS3.mockImplementation(
      async () =>
        await new Promise((resolve) =>
          setTimeout(() => resolve(mockedVendorServiceConfigText), 100)
        )
    );

    await Promise.all([
      getVendorServiceConfigRow(givenConfigBucket, givenFields),
      getVendorServiceConfigRow(givenConfigBucket, givenFields),
    ]);

    expect(mockedFetchS3).toHaveBeenCalledTimes(1);
  });
});
