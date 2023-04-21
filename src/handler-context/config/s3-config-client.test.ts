import { configFileMap, getConfigFile } from "./s3-config-client";
import { ConfigElements } from "./types";

jest.mock("../../shared/utils/s3", () => ({
  fetchS3: jest.fn((_bucket, path) => {
    if (path === configFileMap[ConfigElements.rates])
      return `vendor_id,event_name,volumes_from,volumes_to,unit_price,effective_from,effective_to
a,b,0,1,2,2000-01-01,2049-01-01
c,d,3,,4,2000-01-01,2049-01-01`;
    if (path === configFileMap[ConfigElements.services])
      return `vendor_name,vendor_id,service_name,service_regex,event_name
a,b,c,d,e
f,g,h,i,j`;
    return '[{"val_a": "a", "val_b": "c"}, {"val_a": "b", "val_b": "d"}]';
  }),
}));

describe("getConfigFile", () => {
  beforeEach(() => {
    process.env.CONFIG_BUCKET = "mock-config-bucket";
  });
  afterAll(() => {
    delete process.env.CONFIG_BUCKET;
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
        },
        {
          vendor_name: "f",
          vendor_id: "g",
          service_name: "h",
          service_regex: "i",
          event_name: "j",
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
