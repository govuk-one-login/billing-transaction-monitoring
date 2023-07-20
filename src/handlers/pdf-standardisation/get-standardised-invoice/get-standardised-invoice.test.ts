import { Textract } from "aws-sdk";
import {
  getVendorInvoiceStandardisationModuleId,
  getVendorServiceConfigRows,
} from "../../../shared/utils";
import { getStandardisedInvoice } from "./get-standardised-invoice";
import { getStandardisedInvoice0 } from "./get-standardised-invoice-0";
import { getStandardisedInvoiceDefault } from "./get-standardised-invoice-default";

jest.mock("../../../shared/utils");
const mockedGetVendorInvoiceStandardisationModuleId =
  getVendorInvoiceStandardisationModuleId as jest.Mock;
const mockedGetVendorServiceConfigRows =
  getVendorServiceConfigRows as jest.Mock;

jest.mock("./get-standardised-invoice-0");
const mockedGetStandardisedInvoice0 = getStandardisedInvoice0 as jest.Mock;

jest.mock("./get-standardised-invoice-default");
const mockedGetStandardisedInvoiceDefault =
  getStandardisedInvoiceDefault as jest.Mock;

describe("Standardised invoice getter", () => {
  let mockedStandardisedInvoice0: any;
  let mockedStandardisedInvoiceDefault: any;
  let mockedVendorServiceConfigRows: any;
  let givenVendorId: string;
  let givenOriginalInvoiceFileName: string;
  let givenParserVersions: Record<string, string>;
  let givenTextractPages: Textract.ExpenseDocument[];

  beforeEach(() => {
    jest.resetAllMocks();

    givenVendorId = "given vendor ID";

    givenParserVersions = {
      0: "0_1.2.3",
      default: "default_4.5.6",
    };

    givenTextractPages = "given Textract pages" as any;

    givenOriginalInvoiceFileName = "given-source-file-name.json";

    mockedGetVendorInvoiceStandardisationModuleId.mockReturnValue(0);

    mockedVendorServiceConfigRows = "mocked vendor service config rows";
    mockedGetVendorServiceConfigRows.mockResolvedValue(
      mockedVendorServiceConfigRows
    );

    mockedStandardisedInvoice0 = "mocked standardised invoice 0";
    mockedGetStandardisedInvoice0.mockResolvedValue(mockedStandardisedInvoice0);

    mockedStandardisedInvoiceDefault = "mocked standardised invoice default";
    mockedGetStandardisedInvoiceDefault.mockResolvedValue(
      mockedStandardisedInvoiceDefault
    );
  });

  test("Standardised invoice getter with standardisation config fetch error", async () => {
    const mockedErrorText = "mocked error";
    const mockedError = new Error(mockedErrorText);
    mockedGetVendorInvoiceStandardisationModuleId.mockRejectedValue(
      mockedError
    );

    await expect(
      getStandardisedInvoice(
        givenTextractPages,
        givenVendorId,
        givenParserVersions,
        givenOriginalInvoiceFileName
      )
    ).rejects.toThrowError(mockedErrorText);
    expect(mockedGetVendorInvoiceStandardisationModuleId).toHaveBeenCalledTimes(
      1
    );
    expect(mockedGetVendorInvoiceStandardisationModuleId).toHaveBeenCalledWith(
      givenVendorId
    );
    expect(mockedGetVendorServiceConfigRows).toHaveBeenCalledTimes(1);
    expect(mockedGetVendorServiceConfigRows).toHaveBeenCalledWith({
      vendor_id: givenVendorId,
    });
    expect(mockedGetStandardisedInvoice0).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceDefault).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter with vendor service config fetch error", async () => {
    const mockedErrorText = "mocked error";
    const mockedError = new Error(mockedErrorText);
    mockedGetVendorServiceConfigRows.mockRejectedValue(mockedError);

    await expect(
      getStandardisedInvoice(
        givenTextractPages,
        givenVendorId,
        givenParserVersions,
        givenOriginalInvoiceFileName
      )
    ).rejects.toThrowError(mockedErrorText);
    expect(mockedGetVendorServiceConfigRows).toHaveBeenCalledTimes(1);
    expect(mockedGetVendorServiceConfigRows).toHaveBeenCalledWith({
      vendor_id: givenVendorId,
    });
    expect(
      mockedGetVendorInvoiceStandardisationModuleId
    ).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoice0).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceDefault).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter with no standardisation config module ID", async () => {
    mockedGetVendorInvoiceStandardisationModuleId.mockResolvedValue(undefined);

    const result = await getStandardisedInvoice(
      givenTextractPages,
      givenVendorId,
      givenParserVersions,
      givenOriginalInvoiceFileName
    );

    expect(result).toBe(mockedStandardisedInvoiceDefault);
    expect(mockedGetStandardisedInvoice0).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceDefault).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedInvoiceDefault).toHaveBeenCalledWith(
      givenTextractPages,
      mockedVendorServiceConfigRows,
      givenParserVersions.default,
      givenOriginalInvoiceFileName
    );
  });

  test("Standardised invoice getter with unsupported standardisation config module ID", async () => {
    mockedGetVendorInvoiceStandardisationModuleId.mockResolvedValue(123);

    const result = await getStandardisedInvoice(
      givenTextractPages,
      givenVendorId,
      givenParserVersions,
      givenOriginalInvoiceFileName
    );

    expect(result).toBe(mockedStandardisedInvoiceDefault);
    expect(mockedGetStandardisedInvoice0).not.toHaveBeenCalled();
    expect(mockedGetStandardisedInvoiceDefault).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedInvoiceDefault).toHaveBeenCalledWith(
      givenTextractPages,
      mockedVendorServiceConfigRows,
      givenParserVersions.default,
      givenOriginalInvoiceFileName
    );
  });

  test("Standardised invoice getter with supported standardisation config module ID", async () => {
    const mockedModuleId = 0;
    mockedGetVendorInvoiceStandardisationModuleId.mockResolvedValue(
      mockedModuleId
    );

    const result = await getStandardisedInvoice(
      givenTextractPages,
      givenVendorId,
      givenParserVersions,
      givenOriginalInvoiceFileName
    );

    expect(result).toBe(mockedStandardisedInvoice0);
    expect(mockedGetStandardisedInvoice0).toHaveBeenCalledTimes(1);
    expect(mockedGetStandardisedInvoice0).toHaveBeenCalledWith(
      givenTextractPages,
      mockedVendorServiceConfigRows,
      givenParserVersions[mockedModuleId],
      givenOriginalInvoiceFileName
    );
    expect(mockedGetStandardisedInvoiceDefault).not.toHaveBeenCalled();
  });
});
