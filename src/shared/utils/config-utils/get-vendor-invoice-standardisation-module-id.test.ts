import { ConfigStandardisationRow } from "../../types";
import { getConfig } from "./get-config";
import { getVendorInvoiceStandardisationModuleId } from "./get-vendor-invoice-standardisation-module-id";

jest.mock("./get-config");
const mockedGetConfig = getConfig as jest.Mock;

describe("Vendor invoice standardisation module ID getter", () => {
  let mockedVendorId1: string;
  let mockedVendorId1ConfigItem: ConfigStandardisationRow;
  let mockedVendorId2: string;
  let mockedVendorId2ConfigItem: ConfigStandardisationRow;
  let mockedConfig: ConfigStandardisationRow[];
  let mockedInvoiceStandardisationModuleId1: number;
  let mockedInvoiceStandardisationModuleId2: number;
  let givenVendorId: string;

  beforeEach(() => {
    jest.resetAllMocks();

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
    mockedGetConfig.mockResolvedValue(mockedConfig);

    givenVendorId = "given vendor ID";
  });

  test("Vendor invoice standardisation module ID getter with config", async () => {
    givenVendorId = mockedVendorId2;
    const result = await getVendorInvoiceStandardisationModuleId(givenVendorId);
    expect(result).toEqual(mockedInvoiceStandardisationModuleId2);
  });

  test("Vendor invoice standardisation module ID getter with config error", async () => {
    const mockedGetConfigError = "mocked getConfig error text";
    mockedGetConfig.mockImplementation(() => {
      throw new Error(mockedGetConfigError);
    });

    await expect(
      getVendorInvoiceStandardisationModuleId(givenVendorId)
    ).rejects.toThrowError(mockedGetConfigError);
  });

  test("Vendor invoice standardisation module ID getter with vendor ID not found", async () => {
    givenVendorId =
      "given vendor ID with no vendor invoice standardisation module";

    const result = await getVendorInvoiceStandardisationModuleId(givenVendorId);

    expect(result).toBeUndefined();
  });
});
