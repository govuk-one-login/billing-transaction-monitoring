import { ConfigElements } from "../../constants";
import { getFromEnv } from "../env";
import { configFileMap, getConfigFile } from "./s3-config-client";

jest.mock("../env");
const mockedGetFromEnv = getFromEnv as jest.Mock;

jest.mock("../s3", () => ({
  fetchS3: jest.fn((_bucket, path) => {
    if (path === configFileMap[ConfigElements.rates])
      return `vendor_id,event_name,volumes_from,volumes_to,unit_price,effective_from,effective_to
a,b,0,1,2,2000-01-01,2049-01-01
c,d,3,,4,2000-01-01,2049-01-01`;
    if (path === configFileMap[ConfigElements.services])
      return `vendor_name,vendor_id,service_name,service_regex,event_name,contract_id,invoice_is_quarterly
a,b,c,d,e,f,false
g,h,i,j,k,l,true`;
    return '[{"val_a": "a", "val_b": "c"}, {"val_a": "b", "val_b": "d"}]';
  }),
}));

describe("getConfigFile", () => {
  let mockedEnv: Partial<Record<string, string>>;

  beforeEach(() => {
    mockedEnv = { CONFIG_BUCKET: "mock-config-bucket" };
    mockedGetFromEnv.mockImplementation((key) => mockedEnv[key]);
  });

  describe("Rates file", () => {
    it("Retrieves, parses and returns file from our S3 bucket", async () => {
      const config = await getConfigFile(ConfigElements.rates);
      expect(config).toEqual([
        {
          vendor_id: "a",
          event_name: "b",
          volumes_from: 0,
          volumes_to: 1,
          unit_price: 2,
          effective_from: new Date("2000-01-01"),
          effective_to: new Date("2049-01-01"),
        },
        {
          vendor_id: "c",
          event_name: "d",
          volumes_from: 3,
          volumes_to: undefined,
          unit_price: 4,
          effective_from: new Date("2000-01-01"),
          effective_to: new Date("2049-01-01"),
        },
      ]);
    });
  });

  describe("Services file", () => {
    it("Retrieves, parses and returns file from our S3 bucket", async () => {
      const config = await getConfigFile(ConfigElements.services);
      expect(config).toEqual([
        {
          vendor_name: "a",
          vendor_id: "b",
          service_name: "c",
          service_regex: "d",
          event_name: "e",
          contract_id: "f",
          invoice_is_quarterly: false,
        },
        {
          vendor_name: "g",
          vendor_id: "h",
          service_name: "i",
          service_regex: "j",
          event_name: "k",
          contract_id: "l",
          invoice_is_quarterly: true,
        },
      ]);
    });
  });

  describe("JSON files", () => {
    const isJsonConfigKey = (key: ConfigElements): boolean => {
      const filePath = configFileMap[key];
      return filePath.endsWith(".json");
    };

    const jsonFileNames = Object.values(ConfigElements).filter(isJsonConfigKey);

    it.each(jsonFileNames)(
      "Retrieves, parses and returns config files from our S3 bucket",
      async (configFileName) => {
        const config = await getConfigFile(configFileName);
        expect(config).toEqual([
          { val_a: "a", val_b: "c" },
          { val_a: "b", val_b: "d" },
        ]);
      }
    );
  });
});
