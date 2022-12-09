import { getS3Object } from "../helpers/s3Helper";
import expectedVat from "../../cloudformation/uk-vat.json";
import { resourcePrefix } from "../helpers/envHelper";

describe("\n Verify VAT details exists in S3 config bucket\n", () => {
  test("S3 config bucket should contain VAT details matches with expected vat config file ", async () => {
    const response = await getS3Object(
      `${resourcePrefix()}-config-bucket`,
      "uk-vat.json"
    );
    expect(response?.replace(/\s/g, "")).toEqual(JSON.stringify(expectedVat));
  });
});
