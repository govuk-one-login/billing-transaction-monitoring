window.jest_html_reporters_callback__({"numFailedTestSuites":0,"numFailedTests":0,"numPassedTestSuites":19,"numPassedTests":57,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":19,"numTotalTests":57,"startTime":1693994828933,"success":false,"testResults":[{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693994943197,"runtime":113389,"slow":true,"start":1693994829808},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/email-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Email"],"duration":4532,"failureMessages":[],"fullName":"Email CSV attachment","status":"passed","title":"CSV attachment"},{"ancestorTitles":["Email"],"duration":3251,"failureMessages":[],"fullName":"Email PDF attachment","status":"passed","title":"PDF attachment"},{"ancestorTitles":["Email"],"duration":2665,"failureMessages":[],"fullName":"Email CSV and PDF","status":"passed","title":"CSV and PDF"},{"ancestorTitles":["Email"],"duration":3314,"failureMessages":[],"fullName":"Email CSV, PDF and JPEG","status":"passed","title":"CSV, PDF and JPEG"},{"ancestorTitles":["Email"],"duration":3488,"failureMessages":[],"fullName":"Email Various attachments","status":"passed","title":"Various attachments"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995068173,"runtime":238378,"slow":true,"start":1693994829795},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["New invoice with same month, vendor, service as old line item"],"duration":146912,"failureMessages":[],"fullName":"New invoice with same month, vendor, service as old line item should archive old line item","status":"passed","title":"should archive old line item"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995113906,"runtime":284107,"slow":true,"start":1693994829799},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":74502,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid non-quarterly pdf file in raw-invoice bucket and see that we can see the data in the view","status":"passed","title":"upload valid non-quarterly pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":34226,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid quarterly pdf file in raw-invoice bucket and see that we can see the data in the view","status":"passed","title":"upload valid quarterly pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":52065,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid non-quarterly csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid non-quarterly csv file in raw-invoice bucket and check that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":31886,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid quarterly csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid quarterly csv file in raw-invoice bucket and check that we can see the data in the view"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995141088,"runtime":26897,"slow":true,"start":1693995114191},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-curated-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload invoice standardised data to s3 directly and check the billing curated view"],"duration":22502,"failureMessages":[],"fullName":"\n Upload invoice standardised data to s3 directly and check the billing curated view Uploaded invoice standardised data should match the results from billing curated view","status":"passed","title":"Uploaded invoice standardised data should match the results from billing curated view"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995155536,"runtime":325873,"slow":true,"start":1693994829663},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/dashboard-data-extraction-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n DashboardDataExtractFunction"],"duration":82366,"failureMessages":[],"fullName":"\n DashboardDataExtractFunction should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised non-quarterly invoice data is stored in s3","status":"passed","title":"should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised non-quarterly invoice data is stored in s3"},{"ancestorTitles":["\n DashboardDataExtractFunction"],"duration":151966,"failureMessages":[],"fullName":"\n DashboardDataExtractFunction should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised quarterly invoice data is stored in s3","status":"passed","title":"should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised quarterly invoice data is stored in s3"}]},{"numFailingTests":0,"numPassingTests":6,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995187306,"runtime":31716,"slow":true,"start":1693995155590},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/clean-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":4651,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket and check credit field value","status":"passed","title":"should store cleaned events in the storage bucket and check credit field value"},{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":1507,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket and check credit field value","status":"passed","title":"should store cleaned events in the storage bucket and check credit field value"},{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":1496,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket and check credit field value","status":"passed","title":"should store cleaned events in the storage bucket and check credit field value"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7167,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid ComponentId in the storage bucket","status":"passed","title":"should not store event with invalid ComponentId in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7156,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid Timestamp in the storage bucket","status":"passed","title":"should not store event with invalid Timestamp in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7156,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid timestamp formatted in the storage bucket","status":"passed","title":"should not store event with invalid timestamp formatted in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995199169,"runtime":11845,"slow":true,"start":1693995187324},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Given a csv with event data is uploaded to the transaction csv bucket"],"duration":3868,"failureMessages":[],"fullName":"Given a csv with event data is uploaded to the transaction csv bucket stores the events we care about in the storage bucket","status":"passed","title":"stores the events we care about in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995200077,"runtime":58967,"slow":true,"start":1693995141110},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transaction-view-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":12424,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_1_EVENT_1, vendor_testvendor1, 2, 2005/06/30 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_1_EVENT_1, vendor_testvendor1, 2, 2005/06/30 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13891,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_2_EVENT_2, vendor_testvendor2, 2, 2005/07/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_2_EVENT_2, vendor_testvendor2, 2, 2005/07/10 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13904,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_4, vendor_testvendor3, 7, 2005/08/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_4, vendor_testvendor3, 7, 2005/08/10 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":16940,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_6, vendor_testvendor3, 14, 2005/09/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_6, vendor_testvendor3, 14, 2005/09/10 10:00"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995208075,"runtime":7987,"slow":true,"start":1693995200088},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-raw-store-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n"],"duration":3412,"failureMessages":[],"fullName":"\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ","status":"passed","title":"should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file "}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995214936,"runtime":15747,"slow":true,"start":1693995199189},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-lambda-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1997,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Filter function cloud watch logs should contain eventid","status":"passed","title":"Filter function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":5615,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Clean function cloud watch logs should contain eventid","status":"passed","title":"Clean function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1407,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Store Transactions function cloud watch logs should contain eventid","status":"passed","title":"Store Transactions function cloud watch logs should contain eventid"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995228997,"runtime":14052,"slow":true,"start":1693995214945},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/filter-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Filter function - Happy path tests\n"],"duration":2935,"failureMessages":[],"fullName":"\n Filter function - Happy path tests\n should store event in the storage bucket for a valid event","status":"passed","title":"should store event in the storage bucket for a valid event"},{"ancestorTitles":["\n Filter Function - Unhappy path tests\n"],"duration":7155,"failureMessages":[],"fullName":"\n Filter Function - Unhappy path tests\n should not store events with invalid EventName in the storage bucket","status":"passed","title":"should not store events with invalid EventName in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995234394,"runtime":25841,"slow":true,"start":1693995208553},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/rate-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Execute athena query to retrieve rate details"],"duration":11070,"failureMessages":[],"fullName":"Execute athena query to retrieve rate details retrieved rate details should match rate csv uploaded in s3 config bucket","status":"passed","title":"retrieved rate details should match rate csv uploaded in s3 config bucket"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995238399,"runtime":3989,"slow":false,"start":1693995234410},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-data-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":774,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice bucket should exists in S3","status":"passed","title":"Raw invoice bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":658,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice textract data bucket should exists in S3","status":"passed","title":"Raw invoice textract data bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":660,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Storage bucket should exists in S3","status":"passed","title":"Storage bucket should exists in S3"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995241758,"runtime":12730,"slow":true,"start":1693995229028},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve vendor service details\n"],"duration":11070,"failureMessages":[],"fullName":"\n Execute athena query to retrieve vendor service details\n retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ","status":"passed","title":"retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket "}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995246386,"runtime":4620,"slow":false,"start":1693995241766},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/storage-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Store function test\n"],"duration":2930,"failureMessages":[],"fullName":"\n Store function test\n should store cleaned events in the storage bucket","status":"passed","title":"should store cleaned events in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":14,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995249713,"runtime":181477,"slow":true,"start":1693995068236},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/athena-query-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nGenerate valid event and execute athena query\n"],"duration":13350,"failureMessages":[],"fullName":"\nGenerate valid event and execute athena query\n should contain eventId in the generated query results","status":"passed","title":"should contain eventId in the generated query results"},{"ancestorTitles":["\nGenerate valid UTC+0 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":12203,"failureMessages":[],"fullName":"\nGenerate valid UTC+0 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+0 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":12187,"failureMessages":[],"fullName":"\nGenerate valid UTC+0 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+0 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":12187,"failureMessages":[],"fullName":"\nGenerate valid UTC+0 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+0 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n"],"duration":12215,"failureMessages":[],"fullName":"\nGenerate valid UTC+0 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n should contain eventId in the generated query results for February","status":"passed","title":"should contain eventId in the generated query results for February"},{"ancestorTitles":["\nGenerate valid UTC-6 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":12191,"failureMessages":[],"fullName":"\nGenerate valid UTC-6 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC-6 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":12214,"failureMessages":[],"fullName":"\nGenerate valid UTC-6 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC-6 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":12175,"failureMessages":[],"fullName":"\nGenerate valid UTC-6 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC-6 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n"],"duration":12187,"failureMessages":[],"fullName":"\nGenerate valid UTC-6 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n should contain eventId in the generated query results for February","status":"passed","title":"should contain eventId in the generated query results for February"},{"ancestorTitles":["\nGenerate valid UTC+6 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":12191,"failureMessages":[],"fullName":"\nGenerate valid UTC+6 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+6 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":12195,"failureMessages":[],"fullName":"\nGenerate valid UTC+6 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+6 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":12177,"failureMessages":[],"fullName":"\nGenerate valid UTC+6 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+6 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n"],"duration":12200,"failureMessages":[],"fullName":"\nGenerate valid UTC+6 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n should contain eventId in the generated query results for February","status":"passed","title":"should contain eventId in the generated query results for February"},{"ancestorTitles":["\nGenerate invalid event and execute athena query\n"],"duration":17552,"failureMessages":[],"fullName":"\nGenerate invalid event and execute athena query\n should not contain eventId in the generated query results","status":"passed","title":"should not contain eventId in the generated query results"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995250737,"runtime":4345,"slow":false,"start":1693995246392},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-vat-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Verify VAT details exists in S3 config bucket\n"],"duration":679,"failureMessages":[],"fullName":"\n Verify VAT details exists in S3 config bucket\n S3 config bucket should contain VAT details matches with expected vat config file ","status":"passed","title":"S3 config bucket should contain VAT details matches with expected vat config file "}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995251341,"runtime":12935,"slow":true,"start":1693995238406},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/contract-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve contract details details\n"],"duration":11039,"failureMessages":[],"fullName":"\n Execute athena query to retrieve contract details details\n retrieved contract details should match with contract csv uploaded in s3 config bucket ","status":"passed","title":"retrieved contract details should match with contract csv uploaded in s3 config bucket "}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1693995254375,"runtime":310734,"slow":true,"start":1693994943641},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-and-transaction-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":81600,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":50073,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":95062,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,-1234567.05","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,-1234567.05"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":35528,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":45199,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty for quarterly invoice with different month but same quarter as events,2,£0.64,2,£0.64,0.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty for quarterly invoice with different month but same quarter as events,2,£0.64,2,£0.64,0.0"}]}],"config":{"bail":0,"changedFilesWithAncestor":false,"ci":true,"collectCoverage":false,"collectCoverageFrom":[],"coverageDirectory":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/coverage","coverageProvider":"babel","coverageReporters":["json","text","lcov","clover"],"detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"expand":false,"findRelatedTests":false,"forceExit":false,"globalSetup":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/testSetup.ts","json":false,"lastCommit":false,"listTests":false,"logHeapUsage":false,"maxConcurrency":5,"maxWorkers":4,"noStackTrace":false,"nonFlagArgs":[],"notify":false,"notifyMode":"failure-change","onlyChanged":false,"onlyFailures":false,"openHandlesTimeout":1000,"passWithNoTests":false,"projects":[],"reporters":[["default",{}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-junit/index.js",{"outputDirectory":"reports","outputName":"testReport.xml"}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-html-reporters/index.js",{"publicPath":"./reports/jest-html-reports/test-report-2023-09-06T10:06:28.157Z","filename":"index.html","expand":true,"openReport":true,"pageTitle":"BTM INTEGRATION TEST REPORT"}]],"rootDir":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring","runTestsByPath":false,"seed":-1390397652,"skipFilter":false,"snapshotFormat":{"escapeString":false,"printBasicPrototype":false},"testFailureExitCode":1,"testPathPattern":"","testSequencer":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@jest/test-sequencer/build/index.js","testTimeout":300000,"updateSnapshot":"none","useStderr":false,"verbose":true,"watch":false,"watchAll":false,"watchman":true,"workerThreads":false},"endTime":1693995255908,"_reporterOptions":{"publicPath":"./reports/jest-html-reports/test-report-2023-09-06T10:06:28.157Z","filename":"index.html","expand":true,"pageTitle":"BTM INTEGRATION TEST REPORT","hideIcon":false,"testCommand":"","openReport":true,"failureMessageOnly":0,"enableMergeData":false,"dataMergeLevel":1,"inlineSource":false,"urlForTestFiles":"","darkTheme":false,"includeConsoleLog":false},"logInfoMapping":{},"attachInfos":{}})