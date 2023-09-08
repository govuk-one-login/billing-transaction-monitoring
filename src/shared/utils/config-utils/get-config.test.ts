import { ConfigElements } from "../../constants";
import { clearConfigCache, getConfig } from "./get-config";
import { getConfigFile } from "./s3-config-client";

jest.mock("./s3-config-client");
const mockedGetConfigFile = getConfigFile as jest.Mock;

let mockedConfig: any;

beforeEach(() => {
  jest.resetAllMocks();
  clearConfigCache();

  mockedConfig = "mocked config";
  mockedGetConfigFile.mockResolvedValue(mockedConfig);
});

test("Config Getter", async () => {
  const givenFileName = "given file name" as ConfigElements;

  const result1 = await getConfig(givenFileName);

  expect(result1).toBe(mockedConfig);
  expect(mockedGetConfigFile).toHaveBeenCalledTimes(1);
  expect(mockedGetConfigFile).toHaveBeenCalledWith(givenFileName);

  jest.resetAllMocks();

  const result2 = await getConfig(givenFileName);

  expect(result2).toBe(mockedConfig);
  expect(mockedGetConfigFile).not.toHaveBeenCalled();
});

test("Config Getter explicitly with cache", async () => {
  const givenFileName = "given file name" as ConfigElements;

  const result1 = await getConfig(givenFileName, { withCache: true });

  expect(result1).toBe(mockedConfig);
  expect(mockedGetConfigFile).toHaveBeenCalledTimes(1);
  expect(mockedGetConfigFile).toHaveBeenCalledWith(givenFileName);

  jest.resetAllMocks();

  const result2 = await getConfig(givenFileName, { withCache: true });

  expect(result2).toBe(mockedConfig);
  expect(mockedGetConfigFile).not.toHaveBeenCalled();
});

test("Config Getter without cache", async () => {
  const givenFileName = "given file name" as ConfigElements;

  const result1 = await getConfig(givenFileName, { withCache: false });

  expect(result1).toBe(mockedConfig);
  expect(mockedGetConfigFile).toHaveBeenCalledTimes(1);
  expect(mockedGetConfigFile).toHaveBeenCalledWith(givenFileName);

  const result2 = await getConfig(givenFileName, { withCache: false });

  expect(result2).toBe(mockedConfig);
  expect(mockedGetConfigFile).toHaveBeenCalledTimes(2);
  expect(mockedGetConfigFile).toHaveBeenLastCalledWith(givenFileName);
});
