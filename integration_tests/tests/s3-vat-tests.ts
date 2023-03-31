import { getS3Object } from "../../src/handlers/int-test-support/helpers/s3Helper";
import { configStackName } from "../../src/handlers/int-test-support/helpers/envHelper";

describe("\n Verify VAT details exists in S3 config bucket\n", () => {
  test("S3 config bucket should contain VAT details matches with expected vat config file ", async () => {
    const response = await getS3Object({
      bucket: configStackName(),
      key: "uk-vat.json",
    });
    expect(JSON.parse(response ?? "")).toEqual([
      { rate: 0.2, start: "2011-01-05" },
    ]);
  });
});
