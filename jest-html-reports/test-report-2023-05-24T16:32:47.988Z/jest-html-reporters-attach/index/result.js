window.jest_html_reporters_callback__({"numFailedTestSuites":0,"numFailedTests":0,"numPassedTestSuites":14,"numPassedTests":34,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":14,"numTotalTests":34,"startTime":1684946012948,"success":false,"testResults":[{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946167653,"runtime":153976,"slow":true,"start":1684946013677},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":48732,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid pdf file in raw-invoice bucket and see that we can see the data in the view","status":"passed","title":"upload valid pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":46548,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid csv file in raw-invoice bucket and check that we can see the data in the view"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946176320,"runtime":162781,"slow":true,"start":1684946013539},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["New invoice with same month, vendor, service as old line item"],"duration":103810,"failureMessages":[],"fullName":"New invoice with same month, vendor, service as old line item should archive old line item","status":"passed","title":"should archive old line item"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946185102,"runtime":8762,"slow":true,"start":1684946176340},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Given a csv with event data is uploaded to the transaction csv bucket"],"duration":2337,"failureMessages":[],"fullName":"Given a csv with event data is uploaded to the transaction csv bucket stores the events we care about in the storage bucket","status":"passed","title":"stores the events we care about in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946217604,"runtime":32496,"slow":true,"start":1684946185108},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/events-s3-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests\n\n Generate valid event and expect event id stored in S3\n"],"duration":1870,"failureMessages":[],"fullName":"\n Happy path tests\n\n Generate valid event and expect event id stored in S3\n S3 should contain event id for the generated valid event","status":"passed","title":"S3 should contain event id for the generated valid event"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7574,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid EventName in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid EventName in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7161,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid ComponentId in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid ComponentId in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7205,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid Timestamp in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid Timestamp in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7161,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid timestamp formatted in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid timestamp formatted in the payload"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946222332,"runtime":208566,"slow":true,"start":1684946013766},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-and-transaction-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":30358,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":61462,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":29136,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":29121,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946222465,"runtime":4855,"slow":false,"start":1684946217610},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-raw-store-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n"],"duration":2962,"failureMessages":[],"fullName":"\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ","status":"passed","title":"should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file "}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946225230,"runtime":57201,"slow":true,"start":1684946168029},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transaction-view-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":8847,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 2","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 2"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":8300,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 2","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 2"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":14883,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 7","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 7"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":23560,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 14","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 14"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946231174,"runtime":8822,"slow":true,"start":1684946222352},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-lambda-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":2300,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Filter function cloud watch logs should contain eventid","status":"passed","title":"Filter function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1508,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Clean function cloud watch logs should contain eventid","status":"passed","title":"Clean function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1407,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Store Transactions function cloud watch logs should contain eventid","status":"passed","title":"Store Transactions function cloud watch logs should contain eventid"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946232659,"runtime":7421,"slow":true,"start":1684946225238},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/rate-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Execute athena query to retrieve rate details"],"duration":6131,"failureMessages":[],"fullName":"Execute athena query to retrieve rate details retrieved rate details should match rate csv uploaded in s3 config bucket","status":"passed","title":"retrieved rate details should match rate csv uploaded in s3 config bucket"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946236544,"runtime":3879,"slow":false,"start":1684946232665},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-data-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":1141,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice bucket should exists in S3","status":"passed","title":"Raw invoice bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":568,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice textract data bucket should exists in S3","status":"passed","title":"Raw invoice textract data bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":544,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Storage bucket should exists in S3","status":"passed","title":"Storage bucket should exists in S3"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946238126,"runtime":1575,"slow":false,"start":1684946236551},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-vat-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Verify VAT details exists in S3 config bucket\n"],"duration":436,"failureMessages":[],"fullName":"\n Verify VAT details exists in S3 config bucket\n S3 config bucket should contain VAT details matches with expected vat config file ","status":"passed","title":"S3 config bucket should contain VAT details matches with expected vat config file "}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946238399,"runtime":7219,"slow":true,"start":1684946231180},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve vendor service details\n"],"duration":6106,"failureMessages":[],"fullName":"\n Execute athena query to retrieve vendor service details\n retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ","status":"passed","title":"retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket "}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946244700,"runtime":22227,"slow":true,"start":1684946222473},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/athena-query-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nGenerate valid event and execute athena query\n"],"duration":7958,"failureMessages":[],"fullName":"\nGenerate valid event and execute athena query\n should contain eventId in the generated query results","status":"passed","title":"should contain eventId in the generated query results"},{"ancestorTitles":["\nGenerate invalid event and execute athena query\n"],"duration":12602,"failureMessages":[],"fullName":"\nGenerate invalid event and execute athena query\n should not contain eventId in the generated query results","status":"passed","title":"should not contain eventId in the generated query results"}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684946287269,"runtime":273585,"slow":true,"start":1684946013684},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":86800,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":39984,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":7013,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":39756,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":40864,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6"}]}],"config":{"bail":0,"changedFilesWithAncestor":false,"ci":true,"collectCoverage":false,"collectCoverageFrom":[],"coverageDirectory":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/coverage","coverageProvider":"babel","coverageReporters":["json","text","lcov","clover"],"detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"expand":false,"findRelatedTests":false,"forceExit":false,"globalSetup":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/testSetup.ts","json":false,"lastCommit":false,"listTests":false,"logHeapUsage":false,"maxConcurrency":5,"maxWorkers":4,"noStackTrace":false,"nonFlagArgs":[],"notify":false,"notifyMode":"failure-change","onlyChanged":false,"onlyFailures":false,"passWithNoTests":false,"projects":[],"reporters":[["default",{}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-junit/index.js",{"outputDirectory":"reports","outputName":"testReport.xml"}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-html-reporters/index.js",{"publicPath":"./reports/jest-html-reports/test-report-2023-05-24T16:32:47.988Z","filename":"index.html","expand":true,"openReport":true,"pageTitle":"BTM INTEGRATION TEST REPORT"}]],"rootDir":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring","runTestsByPath":false,"seed":457090641,"skipFilter":false,"snapshotFormat":{"escapeString":false,"printBasicPrototype":false},"testFailureExitCode":1,"testPathPattern":"","testSequencer":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@jest/test-sequencer/build/index.js","testTimeout":300000,"updateSnapshot":"none","useStderr":false,"verbose":true,"watch":false,"watchAll":false,"watchman":true},"endTime":1684946288032,"_reporterOptions":{"publicPath":"./reports/jest-html-reports/test-report-2023-05-24T16:32:47.988Z","filename":"index.html","expand":true,"pageTitle":"BTM INTEGRATION TEST REPORT","hideIcon":false,"testCommand":"","openReport":true,"failureMessageOnly":0,"enableMergeData":false,"dataMergeLevel":1,"inlineSource":false,"urlForTestFiles":"","darkTheme":false,"includeConsoleLog":false},"logInfoMapping":{},"attachInfos":{}})