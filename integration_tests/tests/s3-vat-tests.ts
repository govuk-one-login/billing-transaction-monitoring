import { getS3ItemsList, getS3Object } from "../helpers/s3Helper";
import { default as expectedVat } from "../../cloudformation/uk-vat.json";

describe("\n Verify VAT details exists in S3 config bucket\n", () => {
  test("S3 config bucket should contain VAT details matches with expected vat config file ", async () => {
    const bucketNameMatchString = "di-btm-configbucket-";
    const response = await getS3Object(bucketNameMatchString, "uk-vat.json");
    expect(response).toEqual(JSON.stringify(expectedVat))
  });
});
