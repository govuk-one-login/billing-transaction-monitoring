import { putTextS3 } from "../../shared/utils";
import { store } from "./store";
import { EmailAttachment } from "./types";

jest.mock("../../shared/utils/s3", () => ({
  putTextS3: jest.fn(),
}));

describe("store", () => {
  it("stores a message in S3 in a directory based on the vendor name and a file based on the pdf or csv attachment name", async () => {
    const bucket = "test_bucket";
    const message = {
      content: "some invoice data",
      vendorId: "vendor_testVendor1",
      attachmentName: "vendor1_service_feb_23.csv",
    } as unknown as EmailAttachment;

    await store(bucket, message);
    expect(putTextS3).toHaveBeenCalledWith(
      bucket,
      "vendor_testVendor1/vendor1_service_feb_23.csv",
      "some invoice data"
    );
  });
});
