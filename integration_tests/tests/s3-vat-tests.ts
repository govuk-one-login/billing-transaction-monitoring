import { getS3ItemsList } from "../helpers/s3Helper";


describe( "\n Verify VAT details exists in S3 config bucket\n",() => {
    test("S3 config bucket should contain VAT details", async () => {
        const result = await getS3ItemsList("di-btm-configbucket");
        console.log(result)
    });
});