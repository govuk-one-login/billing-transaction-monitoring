import { resourcePrefix } from "../helpers/envHelper";

import {
  deleteS3Events,
  generatePublishAndValidateEvents,
  
  queryResults,
  
  TableNames,
  TimeStamps,
} from "../helpers/commonHelpers";
import { deleteDirectoryRecursiveInS3,putObjectToS3,
    checkIfS3ObjectExists,
    S3Object } from "../helpers/s3Helper";
import path from "path";
import fs from "fs";


const prefix = resourcePrefix();
const bucketName = `${prefix}-storage`;

describe("\nExecute athena transaction curated query to retrive price \n", () => {
    const folderPrefix = "btm_billing_standardised";
    const testObject: S3Object = {
    bucket: `${prefix}-storage`,
    key: `${folderPrefix}/receipt.txt`,
  };
  beforeAll(async () => {
       await deleteDirectoryRecursiveInS3(bucketName, "btm_transactions");
        // uploading file to s3 will be removed once BTM-276 implemented
        const file = "../payloads/receipt.txt";
        const filePath = path.join(__dirname, file);
        const fileStream = fs.createReadStream(filePath);
        await putObjectToS3(testObject, fileStream);
        const checkFileExists = await checkIfS3ObjectExists(testObject);
        expect(checkFileExists).toBeTruthy();
  });

  test.each`
    eventName                          | clientId     | eventTime                 |numberOfTestEvents|unitPrice  |priceDiff   | qtyDiff   | priceDifferencePercent   | qtyDifferencePercent    
    ${"IPV_PASSPORT_CRI_REQUEST_SENT"} | ${"client1"} |${TimeStamps.CURRENT_TIME} |   ${"2"}         |${3.33}    |${"0.0000"}   | ${"0"}    |${"0.0"}                | ${"0.0"}
  `(
    "results retrived from billing and transaction_curated view query should match with expected vendorname, service name, price and quantity for $numberOfTestEvents",
    async ({
      eventName,clientId ,eventTime,numberOfTestEvents,unitPrice,priceDiff,qtyDiff,priceDifferencePercent,qtyDifferencePercent}) => {
      const expectedPrice = (numberOfTestEvents * unitPrice).toFixed(4);
    const eventIds=await generatePublishAndValidateEvents({
        numberOfTestEvents,
        eventName,
        clientId,
        eventTime,
      });

     const tableName=TableNames.BILLING_TRANSACTION_CURATED
      const response: BillingTransactionCurated[] = await queryResults({clientId,eventName,tableName});
      console.log("🚀 ~ file: billing-transaction-view-tests.ts:56 ~ describe ~ response", response)
      await deleteS3Events(eventIds, eventTime);
      expect(response[0].billing_quantity).toEqual(numberOfTestEvents);
      expect(response[0].transaction_quantity).toEqual(numberOfTestEvents);
      expect(response[0].billing_price).toEqual(expectedPrice);
      expect(response[0].transaction_price).toEqual(expectedPrice);
      expect(response[0].price_difference).toEqual(priceDiff);
      expect(response[0].quantity_difference).toEqual(qtyDiff);
      expect(response[0].price_difference_percentage).toEqual(priceDifferencePercent);
      expect(response[0].quantity_difference_percentage).toEqual(qtyDifferencePercent);
    }
    
  );
})

interface BillingTransactionCurated {
    vendor_name: string;
    service_name: string;
    year: string;
    month: string;
    price_difference: number;
    quantity_difference: number;
    price_difference_percentage: number;
    quantity_difference_percentage: number;
    billing_price: number;
    billing_quantity: number;
    transaction_price: number;
    transaction_quantity: number;
}

 

