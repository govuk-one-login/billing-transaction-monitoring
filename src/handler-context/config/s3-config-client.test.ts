import { getConfigFile } from "./s3-config-client";
import { ConfigElements } from "./types";

jest.mock("../../shared/utils/s3", () => ({
  fetchS3: jest.fn((_bucket, path) => {
    if (path.match(".csv")) return "val_a,val_b\na,c\nb,d";
    if (path.match(".json"))
      return '[{"val_a": "a", "val_b": "c"}, {"val_a": "b", "val_b": "d"}]';
    throw new Error("Couldn't find file extension");
  }),
}));

describe("getConfigFile", () => {
  beforeEach(() => {
    process.env.CONFIG_BUCKET = "mock-config-bucket";
  });
  afterAll(() => {
    delete process.env.CONFIG_BUCKET;
  });

  it.each(Object.values(ConfigElements))(
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
