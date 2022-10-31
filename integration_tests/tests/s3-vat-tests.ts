import { getS3ItemsList, getS3Object } from "../helpers/s3Helper";
import { default as expectedVat } from "../../cloudformation/uk-vat.json";

describe("\n Verify VAT details exists in S3 config bucket\n", () => {
  test.only("S3 config bucket should contain VAT details matches with expected vat config file ", async () => {
    const bucketNameMatchString = "di-btm-configbucket-";
    const result = await getS3ItemsList(bucketNameMatchString);
    const bucketKey = result.Contents?.find((x) =>
      x.Key?.match("uk-vat.json")
    )?.Key?.valueOf() as string;
    const response = await getS3Object(bucketNameMatchString, bucketKey);
    expect(response?.replaceAll('"', "")).toEqual(
      JSON.stringify(expectedVat).replaceAll('"', "")
    );
  });
});
