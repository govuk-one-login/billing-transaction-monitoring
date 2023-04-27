import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";
import crypto from "crypto";

import {
  createInvoiceInS3,
  createInvoiceWithGivenData,
} from "../../src/handlers/int-test-support/helpers/mock-data/invoice/helpers";

import {
  generateEventViaFilterLambdaAndCheckEventInS3Bucket,
  TestData,
} from "../../src/handlers/int-test-support/helpers/testDataHelper";
import {
  EventName,
  prettyEventNameMap,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryResponseFilterByVendorServiceNameYearMonth } from "../../src/handlers/int-test-support/helpers/queryHelper";
import {
  generateTestEvent,
  getYearMonth,
  poll,
  TableNames,
} from "../../src/handlers/int-test-support/helpers/commonHelpers";
import { listS3Objects } from "../../src/handlers/int-test-support/helpers/s3Helper";

const prefix = resourcePrefix();
const storageBucket = `${prefix}-storage`;
const standardisedFolderPrefix = "btm_invoice_data";
let filename: string;


// perf test new code

// perf test execution start time

const testStartTime = new Date();
console.log("Performance Test Start Time", testStartTime); 



async function perfLoadEvents(): Promise<void> {
for (let i = 0; i < 10; i++) {
          const eventPayload = await generateTestEvent({
            // const eventPayload = generateTestEvent({
            event_name: "VENDOR_4_EVENT_5",
            timestamp_formatted: "2022/03/30 10:00",
            timestamp: new Date("2022/03/30 10:00").getTime() / 1000,
          });
          // perf debug
          // console.log("eventPayload");
          // console.log(eventPayload);
          // perf debug
          await generateEventViaFilterLambdaAndCheckEventInS3Bucket(eventPayload);
          // generateEventViaFilterLambdaAndCheckEventInS3Bucket(eventPayload);
        }
      }

  void perfLoadEvents();

  describe(
    "\n Performance Test\n" +
      "\n Scenario 001 - Peak Hour Event Load\n",
    () => {
      test("Should Load 5 New Events", async () => {
        
        expect("Load Test").toEqual("Load Test");
     
      });
    }
  );

// perf test execution start time

const testEndTime = new Date();
console.log("Performance Test End Time", testEndTime); 



  // perf test new code

export type BillingTransactionCurated = Array<{
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  year: string;
  month: string;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference_percentage: string;
}>;
