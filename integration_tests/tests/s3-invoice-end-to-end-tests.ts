import path from "path";
import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  checkIfS3ObjectExists,
  deleteS3Object,
  listS3Objects,
} from "../../src/handlers/int-test-support/helpers/s3Helper";
import { poll } from "../../src/handlers/int-test-support/helpers/commonHelpers";
import {
  randomInvoice,
  randomLineItems,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice";
import { createInvoiceInS3 } from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";
import {
  queryObject,
  startQueryExecutionCommand,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";

const prefix = resourcePrefix();

describe("\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n", () => {
  const storageBucket = `${prefix}-storage`;
  const standardisedFolderPrefix = "btm_billing_standardised";
  const databaseName = `${prefix}-calculations`;
  let filename: string;

  test("upload valid pdf file in raw-invoice bucket and see that we can see the data in the view", async () => {
    const passportCheckItems = randomLineItems(8, {
      description: "passport check",
    });
    const addressCheckItems = randomLineItems(10, {
      description: "address check",
    });
    const invoice = randomInvoice({
      lineItems: [...passportCheckItems, ...addressCheckItems],
    });
    const expectedSubtotals = [
      invoice.getSubtotal("address check"),
      invoice.getSubtotal("passport check"),
    ];
    const expectedQuantities = [
      invoice.getQuantity("address check"),
      invoice.getQuantity("passport check"),
    ];
    const expectedServices = ["Address check", "Passport check"];
    filename = `raw-Invoice-${Math.random()
      .toString(36)
      .substring(2, 7)}-validFile`;

    const s3Object = await createInvoiceInS3({
      invoiceData: invoice,
      filename: `${filename}.pdf`,
    });
    console.log("e2e test invoice filename:", filename);
    const checkRawPdfFileExists = await checkIfS3ObjectExists(s3Object);
    expect(checkRawPdfFileExists).toBeTruthy();

    // Wait for the invoice data to have been written, to some file in the standardised folder.
    await poll(
      async () =>
        await listS3Objects({
          bucketName: storageBucket,
          prefix: standardisedFolderPrefix,
        }),
      ({ Contents }) =>
        !!Contents?.some(
          (s3Object) =>
            s3Object.Key !== undefined &&
            s3Object.Key ===
              `btm_billing_standardised/${filename.slice(0, 27)}.txt`
        ),
      {
        timeout: 60000,
        nonCompleteErrorMessage:
          "Invoice data never appeared in standardised folder",
      }
    );

    // Check the view results match the invoice.
    const queryString = `SELECT * FROM "btm_billing_curated" where vendor_id = 'vendor_testvendor3'`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryObjects: BillingCurated[] = await queryObject(queryId);
    expect(queryObjects.length).toEqual(2);
    queryObjects.sort((q0, q1) => {
      return q0.service_name.localeCompare(q1.service_name);
    });
    for (let i = 0; i < queryObjects.length; i++) {
      expect(invoice.vendor.id).toEqual(queryObjects[i].vendor_id);
      expect(invoice.vendor.name).toEqual(queryObjects[i].vendor_name);
      expect(expectedServices[i]).toEqual(queryObjects[i].service_name);
      expect(invoice.date.getFullYear()).toEqual(+queryObjects[i].year);
      expect(invoice.date.getMonth() + 1).toEqual(+queryObjects[i].month);
      expect(queryObjects[i].quantity.toString()).toEqual(
        queryObjects[i].quantity
      );
      expect(queryObjects[i].price).toMatch(expectedSubtotals[i].toFixed(2));
      expect(+queryObjects[i].quantity).toEqual(expectedQuantities[i]);
    }

    // Check that the invoice got moved to the success folder.
    const isFileMovedToSuccessfulFolder = async (): Promise<boolean> => {
      const result = await listS3Objects({
        bucketName: s3Object.bucket,
        prefix: "successful",
      });
      if (result.Contents === undefined) {
        return false;
      }
      return result.Contents.some((t) => t.Key?.includes(s3Object.key));
    };

    const pollOptions = {
      timeout: 60000,
      nonCompleteErrorMessage:
        "File was not moved to successful folder within the timeout",
    };

    const originalFileExistsInSuccessfulFolder = await poll(
      isFileMovedToSuccessfulFolder,
      (resolution) => resolution,
      pollOptions
    );

    expect(originalFileExistsInSuccessfulFolder).toBeTruthy();
    await deleteS3Object({
      bucket: s3Object.bucket,
      key: `successful/${String(path)}`,
    });
  });

  afterAll(async () => {
    await deleteS3Object({
      bucket: storageBucket,
      key: `${standardisedFolderPrefix}/${filename.slice(0, 27)}.txt`,
    });
  });
});

interface BillingCurated {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  quantity: number;
  price: number;
  year: string;
  month: string;
}
