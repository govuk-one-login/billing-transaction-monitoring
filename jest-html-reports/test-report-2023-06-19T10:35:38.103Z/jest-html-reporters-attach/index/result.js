window.jest_html_reporters_callback__({"numFailedTestSuites":1,"numFailedTests":1,"numPassedTestSuites":16,"numPassedTests":36,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":17,"numTotalTests":37,"startTime":1687170974803,"success":false,"testResults":[{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171187326,"runtime":211791,"slow":true,"start":1687170975535},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["New invoice with same month, vendor, service as old line item"],"duration":145236,"failureMessages":[],"fullName":"New invoice with same month, vendor, service as old line item should archive old line item","status":"passed","title":"should archive old line item"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171203228,"runtime":227592,"slow":true,"start":1687170975636},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-and-transaction-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":40086,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":51420,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":35275,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":34972,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317"}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171225908,"runtime":250363,"slow":true,"start":1687170975545},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":31635,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":48297,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":12815,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":45465,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":45337,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171226921,"runtime":23668,"slow":true,"start":1687171203253},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-curated-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload invoice standardised data to s3 directly and check the billing curated view"],"duration":21981,"failureMessages":[],"fullName":"\n Upload invoice standardised data to s3 directly and check the billing curated view Uploaded invoice standardised data should match the results from billing curated view","status":"passed","title":"Uploaded invoice standardised data should match the results from billing curated view"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171232828,"runtime":5898,"slow":true,"start":1687171226930},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-raw-store-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n"],"duration":4228,"failureMessages":[],"fullName":"\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ","status":"passed","title":"should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file "}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171236305,"runtime":10374,"slow":true,"start":1687171225931},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Given a csv with event data is uploaded to the transaction csv bucket"],"duration":3098,"failureMessages":[],"fullName":"Given a csv with event data is uploaded to the transaction csv bucket stores the events we care about in the storage bucket","status":"passed","title":"stores the events we care about in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171247357,"runtime":271817,"slow":true,"start":1687170975540},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":153798,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid pdf file in raw-invoice bucket and see that we can see the data in the view","status":"passed","title":"upload valid pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":51465,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid csv file in raw-invoice bucket and check that we can see the data in the view"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171248447,"runtime":60916,"slow":true,"start":1687171187531},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transaction-view-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13553,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_1_EVENT_1, vendor_testvendor1, 2, 2005/06/30 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_1_EVENT_1, vendor_testvendor1, 2, 2005/06/30 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13542,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_2_EVENT_2, vendor_testvendor2, 2, 2005/07/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_2_EVENT_2, vendor_testvendor2, 2, 2005/07/10 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":17720,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_4, vendor_testvendor3, 7, 2005/08/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_4, vendor_testvendor3, 7, 2005/08/10 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13533,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_6, vendor_testvendor3, 14, 2005/09/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_6, vendor_testvendor3, 14, 2005/09/10 10:00"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171248564,"runtime":15729,"slow":true,"start":1687171232835},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-lambda-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":8406,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Filter function cloud watch logs should contain eventid","status":"passed","title":"Filter function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1422,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Clean function cloud watch logs should contain eventid","status":"passed","title":"Clean function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1420,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Store Transactions function cloud watch logs should contain eventid","status":"passed","title":"Store Transactions function cloud watch logs should contain eventid"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171260428,"runtime":13045,"slow":true,"start":1687171247383},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/rate-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Execute athena query to retrieve rate details"],"duration":10897,"failureMessages":[],"fullName":"Execute athena query to retrieve rate details retrieved rate details should match rate csv uploaded in s3 config bucket","status":"passed","title":"retrieved rate details should match rate csv uploaded in s3 config bucket"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171261390,"runtime":25077,"slow":true,"start":1687171236313},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/clean-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":2108,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket","status":"passed","title":"should store cleaned events in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7183,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid ComponentId in the storage bucket","status":"passed","title":"should not store event with invalid ComponentId in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7260,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid Timestamp in the storage bucket","status":"passed","title":"should not store event with invalid Timestamp in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7179,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid timestamp formatted in the storage bucket","status":"passed","title":"should not store event with invalid timestamp formatted in the storage bucket"}]},{"numFailingTests":1,"numPassingTests":0,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171261485,"runtime":12911,"slow":true,"start":1687171248574},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts","failureMessage":"\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1m\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m Execute athena query to retrieve vendor service details\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m › retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket \u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoEqual\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // deep equality\u001b[22m\n\n    \u001b[32m- Expected  - 0\u001b[39m\n    \u001b[31m+ Received  + 9\u001b[39m\n\n    \u001b[33m@@ -1,63 +1,72 @@\u001b[39m\n    \u001b[2m  Array [\u001b[22m\n    \u001b[2m    Object {\u001b[22m\n    \u001b[31m+     \"contract_id\": \"1\",\u001b[39m\n    \u001b[2m      \"event_name\": \"VENDOR_1_EVENT_1\",\u001b[22m\n    \u001b[2m      \"service_name\": \"Passport check\",\u001b[22m\n    \u001b[2m      \"service_regex\": \"Passport.*check\",\u001b[22m\n    \u001b[2m      \"vendor_id\": \"vendor_testvendor1\",\u001b[22m\n    \u001b[2m      \"vendor_name\": \"Vendor One\",\u001b[22m\n    \u001b[2m    },\u001b[22m\n    \u001b[2m    Object {\u001b[22m\n    \u001b[31m+     \"contract_id\": \"1\",\u001b[39m\n    \u001b[2m      \"event_name\": \"VENDOR_1_EVENT_3\",\u001b[22m\n    \u001b[2m      \"service_name\": \"Fraud check\",\u001b[22m\n    \u001b[2m      \"service_regex\": \"Fraud.*check\",\u001b[22m\n    \u001b[2m      \"vendor_id\": \"vendor_testvendor1\",\u001b[22m\n    \u001b[2m      \"vendor_name\": \"Vendor One\",\u001b[22m\n    \u001b[2m    },\u001b[22m\n    \u001b[2m    Object {\u001b[22m\n    \u001b[31m+     \"contract_id\": \"1\",\u001b[39m\n    \u001b[2m      \"event_name\": \"VENDOR_1_EVENT_4\",\u001b[22m\n    \u001b[2m      \"service_name\": \"Phone check\",\u001b[22m\n    \u001b[2m      \"service_regex\": \"Phone.*check\",\u001b[22m\n    \u001b[2m      \"vendor_id\": \"vendor_testvendor1\",\u001b[22m\n    \u001b[2m      \"vendor_name\": \"Vendor One\",\u001b[22m\n    \u001b[2m    },\u001b[22m\n    \u001b[2m    Object {\u001b[22m\n    \u001b[31m+     \"contract_id\": \"2\",\u001b[39m\n    \u001b[2m      \"event_name\": \"VENDOR_2_EVENT_2\",\u001b[22m\n    \u001b[2m      \"service_name\": \"Passport check\",\u001b[22m\n    \u001b[2m      \"service_regex\": \"Passport.*check\",\u001b[22m\n    \u001b[2m      \"vendor_id\": \"vendor_testvendor2\",\u001b[22m\n    \u001b[2m      \"vendor_name\": \"Vendor Two\",\u001b[22m\n    \u001b[2m    },\u001b[22m\n    \u001b[2m    Object {\u001b[22m\n    \u001b[31m+     \"contract_id\": \"2\",\u001b[39m\n    \u001b[2m      \"event_name\": \"VENDOR_2_EVENT_7\",\u001b[22m\n    \u001b[2m      \"service_name\": \"Kbv check\",\u001b[22m\n    \u001b[2m      \"service_regex\": \"Kbv.*check\",\u001b[22m\n    \u001b[2m      \"vendor_id\": \"vendor_testvendor2\",\u001b[22m\n    \u001b[2m      \"vendor_name\": \"Vendor Two\",\u001b[22m\n    \u001b[2m    },\u001b[22m\n    \u001b[2m    Object {\u001b[22m\n    \u001b[31m+     \"contract_id\": \"3\",\u001b[39m\n    \u001b[2m      \"event_name\": \"VENDOR_3_EVENT_4\",\u001b[22m\n    \u001b[2m      \"service_name\": \"Passport check\",\u001b[22m\n    \u001b[2m      \"service_regex\": \"Passport.*check\",\u001b[22m\n    \u001b[2m      \"vendor_id\": \"vendor_testvendor3\",\u001b[22m\n    \u001b[2m      \"vendor_name\": \"Vendor Three\",\u001b[22m\n    \u001b[2m    },\u001b[22m\n    \u001b[2m    Object {\u001b[22m\n    \u001b[31m+     \"contract_id\": \"3\",\u001b[39m\n    \u001b[2m      \"event_name\": \"VENDOR_3_EVENT_6\",\u001b[22m\n    \u001b[2m      \"service_name\": \"Address check\",\u001b[22m\n    \u001b[2m      \"service_regex\": \"Address.*check\",\u001b[22m\n    \u001b[2m      \"vendor_id\": \"vendor_testvendor3\",\u001b[22m\n    \u001b[2m      \"vendor_name\": \"Vendor Three\",\u001b[22m\n    \u001b[2m    },\u001b[22m\n    \u001b[2m    Object {\u001b[22m\n    \u001b[31m+     \"contract_id\": \"4\",\u001b[39m\n    \u001b[2m      \"event_name\": \"VENDOR_4_EVENT_5\",\u001b[22m\n    \u001b[2m      \"service_name\": \"Passport check\",\u001b[22m\n    \u001b[2m      \"service_regex\": \"Passport.*check\",\u001b[22m\n    \u001b[2m      \"vendor_id\": \"vendor_testvendor4\",\u001b[22m\n    \u001b[2m      \"vendor_name\": \"Vendor Four\",\u001b[22m\n    \u001b[2m    },\u001b[22m\n    \u001b[2m    Object {\u001b[22m\n    \u001b[31m+     \"contract_id\": \"5\",\u001b[39m\n    \u001b[2m      \"event_name\": \"VENDOR_5_EVENT_1\",\u001b[22m\n    \u001b[2m      \"service_name\": \"Five Data Validation Application\",\u001b[22m\n    \u001b[2m      \"service_regex\": \"Five Data Validation Application\",\u001b[22m\n    \u001b[2m      \"vendor_id\": \"vendor_testvendor5\",\u001b[22m\n    \u001b[2m      \"vendor_name\": \"Vendor Five\",\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 12 |\u001b[39m     \u001b[36mconst\u001b[39m queryJsonObj \u001b[33m=\u001b[39m \u001b[33mJSON\u001b[39m\u001b[33m.\u001b[39mparse(queryResultToString)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 13 |\u001b[39m     \u001b[36mconst\u001b[39m csvData \u001b[33m=\u001b[39m \u001b[36mawait\u001b[39m getVendorServiceConfigRows(configBucket\u001b[33m,\u001b[39m {})\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 14 |\u001b[39m     expect(csvData)\u001b[33m.\u001b[39mtoEqual(queryJsonObj)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m    |\u001b[39m                     \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 15 |\u001b[39m   })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 16 |\u001b[39m })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 17 |\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/vendor-service-athena-tests.ts\u001b[39m\u001b[0m\u001b[2m:14:21)\u001b[22m\u001b[2m\u001b[22m\n","testResults":[{"ancestorTitles":["\n Execute athena query to retrieve vendor service details\n"],"duration":10871,"failureMessages":["Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoEqual\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // deep equality\u001b[22m\n\n\u001b[32m- Expected  - 0\u001b[39m\n\u001b[31m+ Received  + 9\u001b[39m\n\n\u001b[33m@@ -1,63 +1,72 @@\u001b[39m\n\u001b[2m  Array [\u001b[22m\n\u001b[2m    Object {\u001b[22m\n\u001b[31m+     \"contract_id\": \"1\",\u001b[39m\n\u001b[2m      \"event_name\": \"VENDOR_1_EVENT_1\",\u001b[22m\n\u001b[2m      \"service_name\": \"Passport check\",\u001b[22m\n\u001b[2m      \"service_regex\": \"Passport.*check\",\u001b[22m\n\u001b[2m      \"vendor_id\": \"vendor_testvendor1\",\u001b[22m\n\u001b[2m      \"vendor_name\": \"Vendor One\",\u001b[22m\n\u001b[2m    },\u001b[22m\n\u001b[2m    Object {\u001b[22m\n\u001b[31m+     \"contract_id\": \"1\",\u001b[39m\n\u001b[2m      \"event_name\": \"VENDOR_1_EVENT_3\",\u001b[22m\n\u001b[2m      \"service_name\": \"Fraud check\",\u001b[22m\n\u001b[2m      \"service_regex\": \"Fraud.*check\",\u001b[22m\n\u001b[2m      \"vendor_id\": \"vendor_testvendor1\",\u001b[22m\n\u001b[2m      \"vendor_name\": \"Vendor One\",\u001b[22m\n\u001b[2m    },\u001b[22m\n\u001b[2m    Object {\u001b[22m\n\u001b[31m+     \"contract_id\": \"1\",\u001b[39m\n\u001b[2m      \"event_name\": \"VENDOR_1_EVENT_4\",\u001b[22m\n\u001b[2m      \"service_name\": \"Phone check\",\u001b[22m\n\u001b[2m      \"service_regex\": \"Phone.*check\",\u001b[22m\n\u001b[2m      \"vendor_id\": \"vendor_testvendor1\",\u001b[22m\n\u001b[2m      \"vendor_name\": \"Vendor One\",\u001b[22m\n\u001b[2m    },\u001b[22m\n\u001b[2m    Object {\u001b[22m\n\u001b[31m+     \"contract_id\": \"2\",\u001b[39m\n\u001b[2m      \"event_name\": \"VENDOR_2_EVENT_2\",\u001b[22m\n\u001b[2m      \"service_name\": \"Passport check\",\u001b[22m\n\u001b[2m      \"service_regex\": \"Passport.*check\",\u001b[22m\n\u001b[2m      \"vendor_id\": \"vendor_testvendor2\",\u001b[22m\n\u001b[2m      \"vendor_name\": \"Vendor Two\",\u001b[22m\n\u001b[2m    },\u001b[22m\n\u001b[2m    Object {\u001b[22m\n\u001b[31m+     \"contract_id\": \"2\",\u001b[39m\n\u001b[2m      \"event_name\": \"VENDOR_2_EVENT_7\",\u001b[22m\n\u001b[2m      \"service_name\": \"Kbv check\",\u001b[22m\n\u001b[2m      \"service_regex\": \"Kbv.*check\",\u001b[22m\n\u001b[2m      \"vendor_id\": \"vendor_testvendor2\",\u001b[22m\n\u001b[2m      \"vendor_name\": \"Vendor Two\",\u001b[22m\n\u001b[2m    },\u001b[22m\n\u001b[2m    Object {\u001b[22m\n\u001b[31m+     \"contract_id\": \"3\",\u001b[39m\n\u001b[2m      \"event_name\": \"VENDOR_3_EVENT_4\",\u001b[22m\n\u001b[2m      \"service_name\": \"Passport check\",\u001b[22m\n\u001b[2m      \"service_regex\": \"Passport.*check\",\u001b[22m\n\u001b[2m      \"vendor_id\": \"vendor_testvendor3\",\u001b[22m\n\u001b[2m      \"vendor_name\": \"Vendor Three\",\u001b[22m\n\u001b[2m    },\u001b[22m\n\u001b[2m    Object {\u001b[22m\n\u001b[31m+     \"contract_id\": \"3\",\u001b[39m\n\u001b[2m      \"event_name\": \"VENDOR_3_EVENT_6\",\u001b[22m\n\u001b[2m      \"service_name\": \"Address check\",\u001b[22m\n\u001b[2m      \"service_regex\": \"Address.*check\",\u001b[22m\n\u001b[2m      \"vendor_id\": \"vendor_testvendor3\",\u001b[22m\n\u001b[2m      \"vendor_name\": \"Vendor Three\",\u001b[22m\n\u001b[2m    },\u001b[22m\n\u001b[2m    Object {\u001b[22m\n\u001b[31m+     \"contract_id\": \"4\",\u001b[39m\n\u001b[2m      \"event_name\": \"VENDOR_4_EVENT_5\",\u001b[22m\n\u001b[2m      \"service_name\": \"Passport check\",\u001b[22m\n\u001b[2m      \"service_regex\": \"Passport.*check\",\u001b[22m\n\u001b[2m      \"vendor_id\": \"vendor_testvendor4\",\u001b[22m\n\u001b[2m      \"vendor_name\": \"Vendor Four\",\u001b[22m\n\u001b[2m    },\u001b[22m\n\u001b[2m    Object {\u001b[22m\n\u001b[31m+     \"contract_id\": \"5\",\u001b[39m\n\u001b[2m      \"event_name\": \"VENDOR_5_EVENT_1\",\u001b[22m\n\u001b[2m      \"service_name\": \"Five Data Validation Application\",\u001b[22m\n\u001b[2m      \"service_regex\": \"Five Data Validation Application\",\u001b[22m\n\u001b[2m      \"vendor_id\": \"vendor_testvendor5\",\u001b[22m\n\u001b[2m      \"vendor_name\": \"Vendor Five\",\u001b[22m\n    at Object.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts:14:21)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"],"fullName":"\n Execute athena query to retrieve vendor service details\n retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ","status":"failed","title":"retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket "}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171265448,"runtime":3942,"slow":false,"start":1687171261506},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/storage-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Store function test\n"],"duration":2074,"failureMessages":[],"fullName":"\n Store function test\n should store cleaned events in the storage bucket","status":"passed","title":"should store cleaned events in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171267744,"runtime":2292,"slow":false,"start":1687171265452},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-vat-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Verify VAT details exists in S3 config bucket\n"],"duration":544,"failureMessages":[],"fullName":"\n Verify VAT details exists in S3 config bucket\n S3 config bucket should contain VAT details matches with expected vat config file ","status":"passed","title":"S3 config bucket should contain VAT details matches with expected vat config file "}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171269614,"runtime":8219,"slow":true,"start":1687171261395},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-data-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":919,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice bucket should exists in S3","status":"passed","title":"Raw invoice bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":679,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice textract data bucket should exists in S3","status":"passed","title":"Raw invoice textract data bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":2243,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Storage bucket should exists in S3","status":"passed","title":"Storage bucket should exists in S3"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171271477,"runtime":11042,"slow":true,"start":1687171260435},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/filter-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Filter function - Happy path tests\n"],"duration":2228,"failureMessages":[],"fullName":"\n Filter function - Happy path tests\n should store event in the storage bucket for a valid event","status":"passed","title":"should store event in the storage bucket for a valid event"},{"ancestorTitles":["\n Filter Function - Unhappy path tests\n"],"duration":7150,"failureMessages":[],"fullName":"\n Filter Function - Unhappy path tests\n should not store events with invalid EventName in the storage bucket","status":"passed","title":"should not store events with invalid EventName in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1687171280686,"runtime":32231,"slow":true,"start":1687171248455},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/athena-query-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nGenerate valid event and execute athena query\n"],"duration":12624,"failureMessages":[],"fullName":"\nGenerate valid event and execute athena query\n should contain eventId in the generated query results","status":"passed","title":"should contain eventId in the generated query results"},{"ancestorTitles":["\nGenerate invalid event and execute athena query\n"],"duration":17498,"failureMessages":[],"fullName":"\nGenerate invalid event and execute athena query\n should not contain eventId in the generated query results","status":"passed","title":"should not contain eventId in the generated query results"}]}],"config":{"bail":0,"changedFilesWithAncestor":false,"ci":true,"collectCoverage":false,"collectCoverageFrom":[],"coverageDirectory":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/coverage","coverageProvider":"babel","coverageReporters":["json","text","lcov","clover"],"detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"expand":false,"findRelatedTests":false,"forceExit":false,"globalSetup":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/testSetup.ts","json":false,"lastCommit":false,"listTests":false,"logHeapUsage":false,"maxConcurrency":5,"maxWorkers":4,"noStackTrace":false,"nonFlagArgs":[],"notify":false,"notifyMode":"failure-change","onlyChanged":false,"onlyFailures":false,"passWithNoTests":false,"projects":[],"reporters":[["default",{}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-junit/index.js",{"outputDirectory":"reports","outputName":"testReport.xml"}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-html-reporters/index.js",{"publicPath":"./reports/jest-html-reports/test-report-2023-06-19T10:35:38.103Z","filename":"index.html","expand":true,"openReport":true,"pageTitle":"BTM INTEGRATION TEST REPORT"}]],"rootDir":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring","runTestsByPath":false,"seed":2119526476,"skipFilter":false,"snapshotFormat":{"escapeString":false,"printBasicPrototype":false},"testFailureExitCode":1,"testPathPattern":"","testSequencer":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@jest/test-sequencer/build/index.js","testTimeout":300000,"updateSnapshot":"none","useStderr":false,"verbose":true,"watch":false,"watchAll":false,"watchman":true},"endTime":1687171281698,"_reporterOptions":{"publicPath":"./reports/jest-html-reports/test-report-2023-06-19T10:35:38.103Z","filename":"index.html","expand":true,"pageTitle":"BTM INTEGRATION TEST REPORT","hideIcon":false,"testCommand":"","openReport":true,"failureMessageOnly":0,"enableMergeData":false,"dataMergeLevel":1,"inlineSource":false,"urlForTestFiles":"","darkTheme":false,"includeConsoleLog":false},"logInfoMapping":{},"attachInfos":{}})