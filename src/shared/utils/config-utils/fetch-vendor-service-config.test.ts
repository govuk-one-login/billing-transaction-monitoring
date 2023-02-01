import getCsvConverter from "csvtojson";
import { VENDOR_SERVICE_CONFIG_PATH } from "../../constants";
import { fetchS3 } from "../s3";
import {
  getVendorServiceConfigRow,
  setVendorServiceConfig,
  VendorServiceConfigRow,
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

describe("Fetch Vendor Service Config", () => {
  let mockedCsvConverter: any;
  let mockedCsvConverterFromString: jest.Mock;
  let mockedVendorName1: string;
  let mockedVendorName1ServiceConfigRow: VendorServiceConfigRow;
  let mockedVendorName2: string;
  let mockedVendorName2ServiceConfigRow: VendorServiceConfigRow;
  let mockedVendorServiceConfig: VendorServiceConfigRow[];
  let mockedVendorServiceConfigText: string;
  let givenConfigBucket: string;

  beforeEach(() => {
    jest.resetAllMocks();

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
  });

  test("Throws error if no vendor service config found", async () => {});

  test("Throws error if vendor service config is not valid", async () => {});

  test("Converts CSV to Json", async () => {});
});
