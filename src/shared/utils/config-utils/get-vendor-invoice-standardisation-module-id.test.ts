import { VENDOR_INVOICE_STANDARDISATION_CONFIG_PATH } from "../../constants";
import { fetchS3 } from "../s3";
import {
  clearVendorInvoiceStandardisationConfig,
  getVendorInvoiceStandardisationModuleId,
  setVendorInvoiceStandardisationConfig,
  VendorInvoiceStandardisationConfigItem,
} from "./get-vendor-invoice-standardisation-module-id";

jest.mock("../s3");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("Vendor invoice standardisation module ID getter", () => {
  let mockedVendorId1: string;
  let mockedVendorId1ConfigItem: VendorInvoiceStandardisationConfigItem;
  let mockedVendorId2: string;
  let mockedVendorId2ConfigItem: VendorInvoiceStandardisationConfigItem;
  let mockedConfig: VendorInvoiceStandardisationConfigItem[];
  let mockedInvoiceStandardisationModuleId1: number;
  let mockedInvoiceStandardisationModuleId2: number;
  let givenConfigBucket: string;
  let givenVendorId: string;

  beforeEach(() => {
    jest.resetAllMocks();
    clearVendorInvoiceStandardisationConfig();

    mockedVendorId1 = "mocked vendor ID 1";
    mockedInvoiceStandardisationModuleId1 = 123;
    mockedVendorId1ConfigItem = {
      vendorId: mockedVendorId1,
      invoiceStandardisationModuleId: mockedInvoiceStandardisationModuleId1,
    };

    mockedVendorId2 = "mocked vendor ID 2";
    mockedInvoiceStandardisationModuleId2 = 456;
    mockedVendorId2ConfigItem = {
      vendorId: mockedVendorId2,
      invoiceStandardisationModuleId: mockedInvoiceStandardisationModuleId2,
    };

    mockedConfig = [mockedVendorId1ConfigItem, mockedVendorId2ConfigItem];
    mockedFetchS3.mockReturnValue(JSON.stringify(mockedConfig));

    givenConfigBucket = "given config bucket";
    givenVendorId = "given vendor ID";
  });

  test("Vendor invoice standardisation module ID getter with cached config", async () => {
    setVendorInvoiceStandardisationConfig(mockedConfig);

    givenVendorId = mockedVendorId2;

    const result = await getVendorInvoiceStandardisationModuleId(
      givenConfigBucket,
      givenVendorId
    );

    expect(result).toEqual(mockedInvoiceStandardisationModuleId2);
    expect(mockedFetchS3).not.toHaveBeenCalled();
  });

  test("Vendor invoice standardisation module ID getter with no cached config", async () => {
    givenVendorId = mockedVendorId2;

    const result = await getVendorInvoiceStandardisationModuleId(
      givenConfigBucket,
      givenVendorId
    );

    expect(result).toEqual(mockedInvoiceStandardisationModuleId2);
    expect(mockedFetchS3).toHaveBeenCalledTimes(1);
    expect(mockedFetchS3).toHaveBeenCalledWith(
      givenConfigBucket,
      VENDOR_INVOICE_STANDARDISATION_CONFIG_PATH
    );
  });

  test("Vendor invoice standardisation module ID getter with no cached config and fetch error", async () => {
    const mockedFetchS3ErrorText = "mocked fetchS3 error text";
    mockedFetchS3.mockImplementation(() => {
      throw new Error(mockedFetchS3ErrorText);
    });

    await expect(
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenVendorId)
    ).rejects.toThrowError(mockedFetchS3ErrorText);
  });

  test("Vendor invoice standardisation module ID getter with no cached config and no fetched config", async () => {
    mockedFetchS3.mockReturnValue(undefined);

    await expect(
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenVendorId)
    ).rejects.toThrowError("No vendor invoice standardisation config found");
  });

  test("Vendor invoice standardisation module ID getter with no cached config and fetched config not valid JSON", async () => {
    mockedFetchS3.mockReturnValue("{");

    await expect(
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenVendorId)
    ).rejects.toThrowError("not valid JSON");
  });

  test("Vendor invoice standardisation module ID getter with no cached config and fetched config JSON not array", async () => {
    mockedFetchS3.mockReturnValue("{}");

    await expect(
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenVendorId)
    ).rejects.toThrowError("not array");
  });

  test("Vendor invoice standardisation module ID getter with no cached config and fetched config JSON array item not valid", async () => {
    mockedFetchS3.mockReturnValue("[{}]");

    await expect(
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenVendorId)
    ).rejects.toThrowError("Invalid");
  });

  test("Vendor invoice standardisation module ID getter with vendor ID not found", async () => {
    givenVendorId =
      "given vendor ID with no vendor invoice standardisation module";

    const result = await getVendorInvoiceStandardisationModuleId(
      givenConfigBucket,
      givenVendorId
    );

    expect(result).toBeUndefined();
  });

  test("Vendor invoice standardisation module ID getter called multiple times in parallel", async () => {
    mockedFetchS3.mockImplementation(
      async () =>
        await new Promise((resolve) =>
          setTimeout(() => resolve(JSON.stringify(mockedConfig)), 100)
        )
    );

    await Promise.all([
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenVendorId),
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenVendorId),
    ]);

    expect(mockedFetchS3).toHaveBeenCalledTimes(1);
  });
});
