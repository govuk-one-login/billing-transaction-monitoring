import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { simpleParser } from "mailparser";

jest.mock("mailparser");
const mockedSimpleParser = simpleParser as jest.Mock;

describe("process-email business logic", () => {
  let validIncomingEventBody: string;
  let givenInfoLogger: jest.Mock;
  let givenWarnLogger: jest.Mock;
  let mockContext: HandlerCtx<any, any, any>;

  beforeEach(() => {
    jest.resetAllMocks();
    givenInfoLogger = jest.fn();
    givenWarnLogger = jest.fn();

    validIncomingEventBody = "Some valid MIME-Version email message";
    mockContext = {
      config: {},
      logger: {
        info: givenInfoLogger,
        warn: givenWarnLogger,
      },
    } as any;
  });

  test("should throw error if missing bucket name and/or key", async () => {
    const invalidMockMeta = {};

    await expect(
      businessLogic(validIncomingEventBody, mockContext, invalidMockMeta)
    ).rejects.toThrowError("Missing bucketName and/or key");
  });

  test("should return empty array with event record that has no vendor ID folder", async () => {
    const mockMeta = {
      bucketName: "given bucket name",
      key: "given-file-path-with-no-folder",
    };

    const result = await businessLogic(
      validIncomingEventBody,
      mockContext,
      mockMeta
    );

    expect(result).toEqual([]);
  });

  test("should return attachments that are pdf or csv ", async () => {
    mockedSimpleParser.mockReturnValue({
      attachments: [
        {
          contentType: "application/pdf",
          filename: "mock-pdf.pdf",
          content: "mock-pdf-content",
        },
        {
          contentType: "text/csv",
          filename: "mock-csv.csv",
          content: "mock-csv-content",
        },
        {
          contentType: "image/jpeg",
          filename: "mock-image.jpg",
          content: "mock-image-content",
        },
      ],
    });
    const validMockMeta = {
      bucketName: "given bucket name",
      key: "some_vendor_id/given-file-path",
    };

    const mockEmailAttachment = [
      {
        content: "mock-pdf-content",
        vendorId: "some_vendor_id",
        attachmentName: "mock-pdf.pdf",
      },
      {
        content: "mock-csv-content",
        vendorId: "some_vendor_id",
        attachmentName: "mock-csv.csv",
      },
    ];

    const result = await businessLogic(
      validIncomingEventBody,
      mockContext,
      validMockMeta
    );
    expect(result).toEqual(mockEmailAttachment);
  });

  test("should not return attachments that are not pdf or csv ", async () => {
    mockedSimpleParser.mockReturnValue({
      attachments: [
        {
          contentType: "image/jpeg",
          filename: "mock-image.jpg",
          content: "mock-image-content",
        },
      ],
    });
    const validMockMeta = {
      bucketName: "given bucket name",
      key: "some_vendor_id/given-file-path",
    };
    const result = await businessLogic(
      validIncomingEventBody,
      mockContext,
      validMockMeta
    );
    expect(result).toEqual([]);
    expect(givenWarnLogger).toHaveBeenCalledWith(
      "No pdf or csv attachments in given-file-path"
    );
  });

  test("should remove any whitespaces in the attachment filename", async () => {
    mockedSimpleParser.mockReturnValue({
      attachments: [
        {
          contentType: "application/pdf",
          filename: "mock - pdf .pdf", // space in filename
          content: "mock-pdf-content",
        },
      ],
    });

    const validMockMeta = {
      bucketName: "given bucket name",
      key: "some_vendor_id/given-file-path",
    };

    const mockEmailAttachment = [
      {
        content: "mock-pdf-content",
        vendorId: "some_vendor_id",
        attachmentName: "mock-pdf.pdf",
      },
    ];
    const result = await businessLogic(
      validIncomingEventBody,
      mockContext,
      validMockMeta
    );
    expect(result).toEqual(mockEmailAttachment);
  });

  test("should use an MD5 hash of the message content to build a filename if filename is undefined ", async () => {
    mockedSimpleParser.mockReturnValue({
      attachments: [
        {
          contentType: "application/pdf",
          filename: undefined,
          content: "mock-pdf-content",
          checksum: "9d4e23771d6195be7ffc7fb36c82f25a",
        },
      ],
    });

    const validMockMeta = {
      bucketName: "given bucket name",
      key: "some_vendor_id/given-file-path",
    };

    const mockEmailAttachment = [
      {
        content: "mock-pdf-content",
        vendorId: "some_vendor_id",
        attachmentName: "9d4e23771d6195be7ffc7fb36c82f25a.pdf",
      },
    ];
    const result = await businessLogic(
      validIncomingEventBody,
      mockContext,
      validMockMeta
    );
    expect(result).toEqual(mockEmailAttachment);
  });
});
