import { HandlerCtx } from "../../handler-context";
import {
  backUpEventFile,
  getFileContent,
  getKeys,
  storeBucketingFile,
} from "./s3connect";
import { businessLogic } from "./business-logic";

import { MessageBody } from "./types";

jest.mock("./s3connect");
const mockedGetKeys = getKeys as jest.Mock;
const mockedBackupEventFile = backUpEventFile as jest.Mock;
const mockedGetFileContent = getFileContent as jest.Mock;
const mockedStoreBucketingFile = storeBucketingFile as jest.Mock;

describe("Event bucketing businessLogic", () => {
  let validIncomingEventBody: MessageBody;
  let givenCtx: HandlerCtx<any, any, any>;
  let file1: { key: string; content: string };
  let file2: { key: string; content: string };
  let file3: { key: string; content: string };
  let folder1: { key: string; fileKeys: string[] };
  let folder2: { key: string; fileKeys: string[] };
  let givenInfoLogger: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    givenInfoLogger = jest.fn();

    givenCtx = {
      env: {
        STORAGE_BUCKET: "storage_bucket",
        BUCKETING_DAYS_TO_PROCESS: "7",
      },
      logger: {
        info: givenInfoLogger,
      },
    } as any;

    file1 = {
      key: "test_bucket/file1",
      content: "testFileContent1",
    };
    file2 = {
      key: "test_bucket/file2",
      content: "testFileContent2",
    };
    file3 = {
      key: "test_bucket/file3",
      content: "{testcontentevent1}\n{testcontentevent2}",
    };
    folder1 = {
      key: `btm_event_data/2023/01/01`,
      fileKeys: [file1.key, file2.key],
    };
    folder2 = {
      key: `btm_event_data/2023/01/02`,
      fileKeys: [file3.key],
    };
    validIncomingEventBody = {
      start_date: "2023-01-01",
      end_date: "2023-01-01",
    };

    mockedGetKeys.mockImplementation((storageBucket: string, key: string) => {
      if (key === folder1.key) {
        return folder1.fileKeys;
      } else if (key === folder2.key) {
        return folder2.fileKeys;
      } else {
        return [key + "/file1", key + "/file2"];
      }
    });
    mockedGetFileContent.mockImplementation(
      (storageBucket: string, key: string) => {
        if (key === file1.key) {
          return file1.content;
        } else if (key === file2.key) {
          return file2.content;
        } else if (key === file3.key) {
          return file3.content;
        } else {
          return "testFileContent";
        }
      }
    );
  });

  test("Processing 1 folder with 2 events", async () => {
    await businessLogic(validIncomingEventBody, givenCtx);

    expect(mockedGetKeys).toBeCalledTimes(1);
    expect(mockedGetKeys).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      folder1.key
    );

    expect(mockedGetFileContent).toBeCalledTimes(2);
    expect(mockedGetFileContent).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file1.key
    );
    expect(mockedGetFileContent).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file2.key
    );

    expect(mockedBackupEventFile).toBeCalledTimes(2);
    expect(mockedBackupEventFile).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file1.key
    );
    expect(mockedBackupEventFile).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file2.key
    );

    expect(mockedStoreBucketingFile).toBeCalledTimes(1);
    expect(mockedStoreBucketingFile).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      folder1.key,
      `${file1.content}\n${file2.content}`
    );
  });

  test("Processing folders with default no. of days", async () => {
    validIncomingEventBody = {} as any;

    await businessLogic(validIncomingEventBody, givenCtx);

    expect(mockedGetKeys).toBeCalledTimes(7);

    expect(mockedGetFileContent).toBeCalledTimes(14);

    expect(mockedBackupEventFile).toBeCalledTimes(14);

    expect(mockedStoreBucketingFile).toBeCalledTimes(7);
  });

  test("Processing 1 folder with 501 files, expecting 2 consolidation files", async () => {
    folder1.fileKeys = [];
    for (let i = 1; i < 502; i++) {
      folder1.fileKeys.push(`test_bucket/multiple_file${i}`);
    }

    await businessLogic(validIncomingEventBody, givenCtx);

    expect(mockedGetKeys).toBeCalledTimes(1);
    expect(mockedGetKeys).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      folder1.key
    );

    expect(mockedGetFileContent).toBeCalledTimes(501);

    expect(mockedBackupEventFile).toBeCalledTimes(501);

    expect(mockedStoreBucketingFile).toBeCalledTimes(2);
  });

  test("Processing 2 folders, 1 already processed (automated method)", async () => {
    validIncomingEventBody.end_date = "2023-01-02";
    folder2.fileKeys = ["test_bucket/bucketing-extract-123.json"];

    await businessLogic(validIncomingEventBody, givenCtx);

    expect(mockedGetKeys).toBeCalledTimes(2);
    expect(mockedGetKeys).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      folder1.key
    );
    expect(mockedGetKeys).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      folder2.key
    );

    expect(mockedGetFileContent).toBeCalledTimes(2);
    expect(mockedGetFileContent).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file1.key
    );
    expect(mockedGetFileContent).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file2.key
    );

    expect(mockedBackupEventFile).toBeCalledTimes(2);
    expect(mockedBackupEventFile).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file1.key
    );
    expect(mockedBackupEventFile).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file2.key
    );

    expect(mockedStoreBucketingFile).toBeCalledTimes(1);
    expect(mockedStoreBucketingFile).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      folder1.key,
      `${file1.content}\n${file2.content}`
    );
  });

  test("Processing 2 folders, 1 already processed (legacy method)", async () => {
    validIncomingEventBody.end_date = "2023-01-02";

    await businessLogic(validIncomingEventBody, givenCtx);

    expect(mockedGetKeys).toBeCalledTimes(2);
    expect(mockedGetKeys).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      folder1.key
    );
    expect(mockedGetKeys).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      folder2.key
    );

    expect(mockedGetFileContent).toBeCalledTimes(3);
    expect(mockedGetFileContent).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file1.key
    );
    expect(mockedGetFileContent).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file2.key
    );
    expect(mockedGetFileContent).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file3.key
    );

    expect(mockedBackupEventFile).toBeCalledTimes(2);
    expect(mockedBackupEventFile).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file1.key
    );
    expect(mockedBackupEventFile).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      file2.key
    );

    expect(mockedStoreBucketingFile).toBeCalledTimes(1);
    expect(mockedStoreBucketingFile).toBeCalledWith(
      givenCtx.env.STORAGE_BUCKET,
      folder1.key,
      `${file1.content}\n${file2.content}`
    );
  });
});
