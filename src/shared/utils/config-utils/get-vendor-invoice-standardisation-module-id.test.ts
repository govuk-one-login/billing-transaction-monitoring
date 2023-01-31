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
  let mockedClientId1: string;
  let mockedClientId1ConfigItem: VendorInvoiceStandardisationConfigItem;
  let mockedClientId2: string;
  let mockedClientId2ConfigItem: VendorInvoiceStandardisationConfigItem;
  let mockedConfig: VendorInvoiceStandardisationConfigItem[];
  let mockedInvoiceStandardisationModuleId1: number;
  let mockedInvoiceStandardisationModuleId2: number;
  let givenConfigBucket: string;
  let givenClientId: string;

  beforeEach(() => {
    jest.resetAllMocks();
    clearVendorInvoiceStandardisationConfig();

    mockedClientId1 = "mocked client ID 1";
    mockedInvoiceStandardisationModuleId1 = 123;
    mockedClientId1ConfigItem = {
      clientId: mockedClientId1,
      invoiceStandardisationModuleId: mockedInvoiceStandardisationModuleId1,
    };

    mockedClientId2 = "mocked client ID 2";
    mockedInvoiceStandardisationModuleId2 = 456;
    mockedClientId2ConfigItem = {
      clientId: mockedClientId2,
      invoiceStandardisationModuleId: mockedInvoiceStandardisationModuleId2,
    };

    mockedConfig = [mockedClientId1ConfigItem, mockedClientId2ConfigItem];
    mockedFetchS3.mockReturnValue(JSON.stringify(mockedConfig));

    givenConfigBucket = "given config bucket";
    givenClientId = "given client ID";
  });

  test("Vendor invoice standardisation module ID getter with cached config", async () => {
    setVendorInvoiceStandardisationConfig(mockedConfig);

    givenClientId = mockedClientId2;

    const result = await getVendorInvoiceStandardisationModuleId(
      givenConfigBucket,
      givenClientId
    );

    expect(result).toEqual(mockedInvoiceStandardisationModuleId2);
    expect(mockedFetchS3).not.toHaveBeenCalled();
  });

  test("Vendor invoice standardisation module ID getter with no cached config", async () => {
    givenClientId = mockedClientId2;

    const result = await getVendorInvoiceStandardisationModuleId(
      givenConfigBucket,
      givenClientId
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
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenClientId)
    ).rejects.toThrowError(mockedFetchS3ErrorText);
  });

  test("Vendor invoice standardisation module ID getter with no cached config and no fetched config", async () => {
    mockedFetchS3.mockReturnValue(undefined);

    await expect(
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenClientId)
    ).rejects.toThrowError("No vendor invoice standardisation config found");
  });

  test("Vendor invoice standardisation module ID getter with no cached config and fetched config not valid JSON", async () => {
    mockedFetchS3.mockReturnValue("{");

    await expect(
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenClientId)
    ).rejects.toThrowError("not valid JSON");
  });

  test("Vendor invoice standardisation module ID getter with no cached config and fetched config JSON not array", async () => {
    mockedFetchS3.mockReturnValue("{}");

    await expect(
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenClientId)
    ).rejects.toThrowError("not array");
  });

  test("Vendor invoice standardisation module ID getter with no cached config and fetched config JSON array item not valid", async () => {
    mockedFetchS3.mockReturnValue("[{}]");

    await expect(
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenClientId)
    ).rejects.toThrowError("Invalid");
  });

  test("Vendor invoice standardisation module ID getter with client ID not found", async () => {
    givenClientId =
      "given client ID with no vendor invoice standardisation module";

    const result = await getVendorInvoiceStandardisationModuleId(
      givenConfigBucket,
      givenClientId
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
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenClientId),
      getVendorInvoiceStandardisationModuleId(givenConfigBucket, givenClientId),
    ]);

    expect(mockedFetchS3).toHaveBeenCalledTimes(1);
  });
});
