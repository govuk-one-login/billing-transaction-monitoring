window.jest_html_reporters_callback__({"numFailedTestSuites":0,"numFailedTests":0,"numPassedTestSuites":20,"numPassedTests":46,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":20,"numTotalTests":46,"startTime":1688459614446,"success":false,"testResults":[{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688459732790,"runtime":117511,"slow":true,"start":1688459615279},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/email-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Email"],"duration":5566,"failureMessages":[],"fullName":"Email CSV attachment","status":"passed","title":"CSV attachment"},{"ancestorTitles":["Email"],"duration":3243,"failureMessages":[],"fullName":"Email PDF attachment","status":"passed","title":"PDF attachment"},{"ancestorTitles":["Email"],"duration":2691,"failureMessages":[],"fullName":"Email CSV and PDF","status":"passed","title":"CSV and PDF"},{"ancestorTitles":["Email"],"duration":3334,"failureMessages":[],"fullName":"Email CSV, PDF and JPEG","status":"passed","title":"CSV, PDF and JPEG"},{"ancestorTitles":["Email"],"duration":3062,"failureMessages":[],"fullName":"Email Various attachments","status":"passed","title":"Various attachments"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688459818375,"runtime":85210,"slow":true,"start":1688459733165},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/dashboard-data-extraction-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n DashboardDataExtractFunction"],"duration":82212,"failureMessages":[],"fullName":"\n DashboardDataExtractFunction should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised invoice data is stored in s3","status":"passed","title":"should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised invoice data is stored in s3"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688459936949,"runtime":321608,"slow":true,"start":1688459615341},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":195812,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid pdf file in raw-invoice bucket and see that we can see the data in the view","status":"passed","title":"upload valid pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":31965,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid csv file in raw-invoice bucket and check that we can see the data in the view"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688459995712,"runtime":380534,"slow":true,"start":1688459615178},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["New invoice with same month, vendor, service as old line item"],"duration":289413,"failureMessages":[],"fullName":"New invoice with same month, vendor, service as old line item should archive old line item","status":"passed","title":"should archive old line item"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688459996227,"runtime":59255,"slow":true,"start":1688459936972},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transaction-view-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":12451,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_1_EVENT_1, vendor_testvendor1, 2, 2005/06/30 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_1_EVENT_1, vendor_testvendor1, 2, 2005/06/30 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13927,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_2_EVENT_2, vendor_testvendor2, 2, 2005/07/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_2_EVENT_2, vendor_testvendor2, 2, 2005/07/10 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":15447,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_4, vendor_testvendor3, 7, 2005/08/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_4, vendor_testvendor3, 7, 2005/08/10 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":15447,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_6, vendor_testvendor3, 14, 2005/09/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_6, vendor_testvendor3, 14, 2005/09/10 10:00"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460021795,"runtime":26060,"slow":true,"start":1688459995735},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-curated-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload invoice standardised data to s3 directly and check the billing curated view"],"duration":22616,"failureMessages":[],"fullName":"\n Upload invoice standardised data to s3 directly and check the billing curated view Uploaded invoice standardised data should match the results from billing curated view","status":"passed","title":"Uploaded invoice standardised data should match the results from billing curated view"}]},{"numFailingTests":0,"numPassingTests":6,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460027697,"runtime":31448,"slow":true,"start":1688459996249},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/clean-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":2804,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket and check credit field value","status":"passed","title":"should store cleaned events in the storage bucket and check credit field value"},{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":1957,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket and check credit field value","status":"passed","title":"should store cleaned events in the storage bucket and check credit field value"},{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":1643,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket and check credit field value","status":"passed","title":"should store cleaned events in the storage bucket and check credit field value"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7347,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid ComponentId in the storage bucket","status":"passed","title":"should not store event with invalid ComponentId in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7241,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid Timestamp in the storage bucket","status":"passed","title":"should not store event with invalid Timestamp in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7520,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid timestamp formatted in the storage bucket","status":"passed","title":"should not store event with invalid timestamp formatted in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460034485,"runtime":12671,"slow":true,"start":1688460021814},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Given a csv with event data is uploaded to the transaction csv bucket"],"duration":3921,"failureMessages":[],"fullName":"Given a csv with event data is uploaded to the transaction csv bucket stores the events we care about in the storage bucket","status":"passed","title":"stores the events we care about in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460035603,"runtime":7896,"slow":true,"start":1688460027707},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-raw-store-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n"],"duration":4595,"failureMessages":[],"fullName":"\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ","status":"passed","title":"should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file "}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460047124,"runtime":228723,"slow":true,"start":1688459818401},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-and-transaction-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":100385,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":54788,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":35338,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,-1234567.05","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,-1234567.05"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":35414,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460049771,"runtime":14157,"slow":true,"start":1688460035614},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/rate-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Execute athena query to retrieve rate details"],"duration":11091,"failureMessages":[],"fullName":"Execute athena query to retrieve rate details retrieved rate details should match rate csv uploaded in s3 config bucket","status":"passed","title":"retrieved rate details should match rate csv uploaded in s3 config bucket"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460053037,"runtime":18539,"slow":true,"start":1688460034498},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-lambda-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":8630,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Filter function cloud watch logs should contain eventid","status":"passed","title":"Filter function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1659,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Clean function cloud watch logs should contain eventid","status":"passed","title":"Clean function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1636,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Store Transactions function cloud watch logs should contain eventid","status":"passed","title":"Store Transactions function cloud watch logs should contain eventid"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460062422,"runtime":12644,"slow":true,"start":1688460049778},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve vendor service details\n"],"duration":11131,"failureMessages":[],"fullName":"\n Execute athena query to retrieve vendor service details\n retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ","status":"passed","title":"retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket "}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460064225,"runtime":11178,"slow":true,"start":1688460053047},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/filter-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Filter function - Happy path tests\n"],"duration":2387,"failureMessages":[],"fullName":"\n Filter function - Happy path tests\n should store event in the storage bucket for a valid event","status":"passed","title":"should store event in the storage bucket for a valid event"},{"ancestorTitles":["\n Filter Function - Unhappy path tests\n"],"duration":7191,"failureMessages":[],"fullName":"\n Filter Function - Unhappy path tests\n should not store events with invalid EventName in the storage bucket","status":"passed","title":"should not store events with invalid EventName in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460066022,"runtime":3593,"slow":false,"start":1688460062429},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-data-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":675,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice bucket should exists in S3","status":"passed","title":"Raw invoice bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":654,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice textract data bucket should exists in S3","status":"passed","title":"Raw invoice textract data bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":781,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Storage bucket should exists in S3","status":"passed","title":"Storage bucket should exists in S3"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460069941,"runtime":3912,"slow":false,"start":1688460066029},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/storage-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Store function test\n"],"duration":2489,"failureMessages":[],"fullName":"\n Store function test\n should store cleaned events in the storage bucket","status":"passed","title":"should store cleaned events in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460072021,"runtime":2071,"slow":false,"start":1688460069950},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-vat-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Verify VAT details exists in S3 config bucket\n"],"duration":710,"failureMessages":[],"fullName":"\n Verify VAT details exists in S3 config bucket\n S3 config bucket should contain VAT details matches with expected vat config file ","status":"passed","title":"S3 config bucket should contain VAT details matches with expected vat config file "}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460076367,"runtime":461022,"slow":true,"start":1688459615345},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":152446,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":107470,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":12404,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":46756,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":46882,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460076860,"runtime":12629,"slow":true,"start":1688460064231},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/contract-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve contract details details\n"],"duration":11034,"failureMessages":[],"fullName":"\n Execute athena query to retrieve contract details details\n retrieved contract details should match with contract csv uploaded in s3 config bucket ","status":"passed","title":"retrieved contract details should match with contract csv uploaded in s3 config bucket "}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1688460079722,"runtime":32582,"slow":true,"start":1688460047140},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/athena-query-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nGenerate valid event and execute athena query\n"],"duration":12856,"failureMessages":[],"fullName":"\nGenerate valid event and execute athena query\n should contain eventId in the generated query results","status":"passed","title":"should contain eventId in the generated query results"},{"ancestorTitles":["\nGenerate invalid event and execute athena query\n"],"duration":17629,"failureMessages":[],"fullName":"\nGenerate invalid event and execute athena query\n should not contain eventId in the generated query results","status":"passed","title":"should not contain eventId in the generated query results"}]}],"config":{"bail":0,"changedFilesWithAncestor":false,"ci":true,"collectCoverage":false,"collectCoverageFrom":[],"coverageDirectory":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/coverage","coverageProvider":"babel","coverageReporters":["json","text","lcov","clover"],"detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"expand":false,"findRelatedTests":false,"forceExit":false,"globalSetup":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/testSetup.ts","json":false,"lastCommit":false,"listTests":false,"logHeapUsage":false,"maxConcurrency":5,"maxWorkers":4,"noStackTrace":false,"nonFlagArgs":[],"notify":false,"notifyMode":"failure-change","onlyChanged":false,"onlyFailures":false,"openHandlesTimeout":1000,"passWithNoTests":false,"projects":[],"reporters":[["default",{}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-junit/index.js",{"outputDirectory":"reports","outputName":"testReport.xml"}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-html-reporters/index.js",{"publicPath":"./reports/jest-html-reports/test-report-2023-07-04T08:32:55.148Z","filename":"index.html","expand":true,"openReport":true,"pageTitle":"BTM INTEGRATION TEST REPORT"}]],"rootDir":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring","runTestsByPath":false,"seed":-786791195,"skipFilter":false,"snapshotFormat":{"escapeString":false,"printBasicPrototype":false},"testFailureExitCode":1,"testPathPattern":"","testSequencer":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@jest/test-sequencer/build/index.js","testTimeout":300000,"updateSnapshot":"none","useStderr":false,"verbose":true,"watch":false,"watchAll":false,"watchman":true,"workerThreads":false},"endTime":1688460081100,"_reporterOptions":{"publicPath":"./reports/jest-html-reports/test-report-2023-07-04T08:32:55.148Z","filename":"index.html","expand":true,"pageTitle":"BTM INTEGRATION TEST REPORT","hideIcon":false,"testCommand":"","openReport":true,"failureMessageOnly":0,"enableMergeData":false,"dataMergeLevel":1,"inlineSource":false,"urlForTestFiles":"","darkTheme":false,"includeConsoleLog":false},"logInfoMapping":{},"attachInfos":{}})