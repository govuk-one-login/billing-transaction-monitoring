import { HandlerCtx } from "../../handler-context";
import { businessLogic } from "./business-logic";
import { simpleParser } from "mailparser";

jest.mock("mailparser");
const mockedSimpleParser = simpleParser as jest.Mock;
describe("process-email business logic", () => {
  const mockLogger = {
    info: jest.fn(),
  };

  const mockContext = {
    logger: mockLogger,
  } as unknown as HandlerCtx<any, any, any>;

  const validIncomingEventBody = "Some valid MIME email message";

  test("should throw error with event record that has no vendor ID folder", async () => {
    const invalidMockMeta = {
      bucketName: "given bucket name",
      key: "given-file-path-with-no-folder",
    };

    await expect(
      businessLogic(validIncomingEventBody, mockContext, invalidMockMeta)
    ).rejects.toThrowError("File not in vendor ID folder");
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
      key: "some vendor id/given-file-path",
    };

    const mockEmailAttachment = [
      {
        content: "mock-pdf-content",
        vendorId: "some vendor id",
        attachmentName: "mock-pdf.pdf",
      },
      {
        content: "mock-csv-content",
        vendorId: "some vendor id",
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
      key: "some vendor id/given-file-path",
    };

    await expect(
      businessLogic(validIncomingEventBody, mockContext, validMockMeta)
    ).rejects.toThrowError("No pdf or csv attachments");
  });
});
