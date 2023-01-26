import { resourcePrefix } from "../../src/handlers/int-test-support/helpers/envHelper";

const prefix = resourcePrefix();

describe("\n Given a csv with event data is uploaded to the transformation bucket", () => {
  // 1. Ensure S3 bucket storage/btm_transactions is empty
  // 2. Add const testPaths (see lines 12-229)
  // 3. Augment the data (see line 231)
  // 4. Convert to a csv string (see line 237)
  // 5. Upload the csv file to S3 transformation bucket

  // const testPaths: TestPaths = [
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "LEVEL_1",
  //     status: "BILLABLE",
  //     path: "happy",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "LEVEL_1",
  //     status: "REPEAT-BILLABLE",
  //     path: "happy",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "LEVEL_1",
  //     status: "BILLABLE-UPLIFT",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "LEVEL_1",
  //     status: "GOOP",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "LEVEL_2",
  //     status: "BILLABLE",
  //     path: "happy",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "LEVEL_2",
  //     status: "REPEAT-BILLABLE",
  //     path: "happy",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "LEVEL_2",
  //     status: "BILLABLE-UPLIFT",
  //     path: "happy",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "LEVEL_2",
  //     status: "GOOP",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "GOOP",
  //     status: "BILLABLE",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "GOOP",
  //     status: "REPEAT-BILLABLE",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "GOOP",
  //     status: "BILLABLE-UPLIFT",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client4.co.uk",
  //     loa: "GOOP",
  //     status: "GOOP",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "LEVEL_1",
  //     status: "BILLABLE",
  //     path: "happy",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "LEVEL_1",
  //     status: "REPEAT-BILLABLE",
  //     path: "happy",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "LEVEL_1",
  //     status: "BILLABLE-UPLIFT",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "LEVEL_1",
  //     status: "GOOP",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "LEVEL_2",
  //     status: "BILLABLE",
  //     path: "happy",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "LEVEL_2",
  //     status: "REPEAT-BILLABLE",
  //     path: "happy",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "LEVEL_2",
  //     status: "BILLABLE-UPLIFT",
  //     path: "happy",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "LEVEL_2",
  //     status: "GOOP",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "GOOP",
  //     status: "BILLABLE",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "GOOP",
  //     status: "REPEAT-BILLABLE",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "GOOP",
  //     status: "BILLABLE-UPLIFT",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://a.client3.eu",
  //     loa: "GOOP",
  //     status: "GOOP",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "LEVEL_1",
  //     status: "BILLABLE",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "LEVEL_1",
  //     status: "REPEAT-BILLABLE",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "LEVEL_1",
  //     status: "BILLABLE-UPLIFT",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "LEVEL_1",
  //     status: "GOOP",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "LEVEL_2",
  //     status: "BILLABLE",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "LEVEL_2",
  //     status: "REPEAT-BILLABLE",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "LEVEL_2",
  //     status: "BILLABLE-UPLIFT",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "LEVEL_2",
  //     status: "GOOP",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "GOOP",
  //     status: "BILLABLE",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "GOOP",
  //     status: "REPEAT-BILLABLE",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "GOOP",
  //     status: "BILLABLE-UPLIFT",
  //     path: "sad",
  //   },
  //   {
  //     entity: "https://g.oo.p",
  //     loa: "GOOP",
  //     status: "GOOP",
  //     path: "sad",
  //   },
  // ];
  //
  // const augmentedData = addFauxDataToTestPaths(testPaths, {
  //   Timestamp: // maybe hardcode this? For example "2023-01-01T00:27:41.186Z"
  //   "RP Entity Id": "fake rp entity id",
  //   "Request Id": // this needs to be unique per row
  // });
  //
  // const csvString = objectsToCSV(augmentedData, {filterKeys: ['path'], renameKeys: new Map([['entity', 'Idp Entity Id'], ['loa', 'Minimum Level Of Assurance'], ['status', 'Billable Status']])})

  it("stores valid events in the storage/btm_transactions/yyyy-mm-dd folder", async () => {
    // TODO
  });

  it("does not store invalid events in the storage/btm-transactions/yyyy-mm-dd folder", async () => {
    // TODO
  });
});
