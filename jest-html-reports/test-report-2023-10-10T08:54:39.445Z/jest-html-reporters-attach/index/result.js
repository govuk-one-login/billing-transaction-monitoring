window.jest_html_reporters_callback__({"numFailedTestSuites":0,"numFailedTests":0,"numPassedTestSuites":20,"numPassedTests":60,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":20,"numTotalTests":60,"startTime":1696928118489,"success":false,"testResults":[{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928232272,"runtime":112967,"slow":true,"start":1696928119305},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/email-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Email"],"duration":5733,"failureMessages":[],"fullName":"Email CSV attachment","status":"passed","title":"CSV attachment"},{"ancestorTitles":["Email"],"duration":1742,"failureMessages":[],"fullName":"Email PDF attachment","status":"passed","title":"PDF attachment"},{"ancestorTitles":["Email"],"duration":3403,"failureMessages":[],"fullName":"Email CSV and PDF","status":"passed","title":"CSV and PDF"},{"ancestorTitles":["Email"],"duration":2696,"failureMessages":[],"fullName":"Email CSV, PDF and JPEG","status":"passed","title":"CSV, PDF and JPEG"},{"ancestorTitles":["Email"],"duration":2702,"failureMessages":[],"fullName":"Email Various attachments","status":"passed","title":"Various attachments"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928290367,"runtime":57927,"slow":true,"start":1696928232440},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/synthetic-events-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Synthetic Events Generation Tests\n"],"duration":10359,"failureMessages":[],"fullName":"\n Synthetic Events Generation Tests\n should generate synthetic events for missing events in the full extract","status":"passed","title":"should generate synthetic events for missing events in the full extract"},{"ancestorTitles":["\n Synthetic Events Generation Tests\n"],"duration":30937,"failureMessages":[],"fullName":"\n Synthetic Events Generation Tests\n should generate synthetic events when the quantity in the full extract is less than the synthetic config quantity","status":"passed","title":"should generate synthetic events when the quantity in the full extract is less than the synthetic config quantity"},{"ancestorTitles":["\n Synthetic Events Generation Tests\n"],"duration":10380,"failureMessages":[],"fullName":"\n Synthetic Events Generation Tests\n should not generate synthetic events when the event exists and the quantity in the extract matches with synthetic config quantity","status":"passed","title":"should not generate synthetic events when the event exists and the quantity in the extract matches with synthetic config quantity"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928336378,"runtime":217101,"slow":true,"start":1696928119277},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":35529,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid non-quarterly pdf file in raw-invoice bucket and see that we can see the data in the view","status":"passed","title":"upload valid non-quarterly pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":32749,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid quarterly pdf file in raw-invoice bucket and see that we can see the data in the view","status":"passed","title":"upload valid quarterly pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":30792,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid non-quarterly csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid non-quarterly csv file in raw-invoice bucket and check that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":31267,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid quarterly csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid quarterly csv file in raw-invoice bucket and check that we can see the data in the view"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928364978,"runtime":28389,"slow":true,"start":1696928336589},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-curated-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload invoice standardised data to s3 directly and check the billing curated view"],"duration":21395,"failureMessages":[],"fullName":"\n Upload invoice standardised data to s3 directly and check the billing curated view Uploaded invoice standardised data should match the results from billing curated view","status":"passed","title":"Uploaded invoice standardised data should match the results from billing curated view"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928418175,"runtime":53187,"slow":true,"start":1696928364988},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transaction-view-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13368,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_1_EVENT_1, vendor_testvendor1, 2, 2005/06/30 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_1_EVENT_1, vendor_testvendor1, 2, 2005/06/30 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13490,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_2_EVENT_2, vendor_testvendor2, 2, 2005/07/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_2_EVENT_2, vendor_testvendor2, 2, 2005/07/10 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13033,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_4, vendor_testvendor3, 7, 2005/08/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_4, vendor_testvendor3, 7, 2005/08/10 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":11650,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_6, vendor_testvendor3, 14, 2005/09/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_6, vendor_testvendor3, 14, 2005/09/10 10:00"}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928433829,"runtime":314587,"slow":true,"start":1696928119242},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-and-transaction-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":40267,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":48478,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":35871,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,-1234567.05","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,-1234567.05"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":33651,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":58456,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty for quarterly invoice with different month but same quarter as events,2,£0.64,2,£0.64,0.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty for quarterly invoice with different month but same quarter as events,2,£0.64,2,£0.64,0.0"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928454209,"runtime":334921,"slow":true,"start":1696928119288},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/dashboard-data-extraction-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n DashboardDataExtractFunction"],"duration":81150,"failureMessages":[],"fullName":"\n DashboardDataExtractFunction should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised non-quarterly invoice data is stored in s3","status":"passed","title":"should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised non-quarterly invoice data is stored in s3"},{"ancestorTitles":["\n DashboardDataExtractFunction"],"duration":150811,"failureMessages":[],"fullName":"\n DashboardDataExtractFunction should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised quarterly invoice data is stored in s3","status":"passed","title":"should save an updated full-extract.json file, which is reflected in the btm_monthly_extract table, when standardised quarterly invoice data is stored in s3"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928464776,"runtime":10539,"slow":true,"start":1696928454237},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Given a csv with event data is uploaded to the transaction csv bucket"],"duration":2405,"failureMessages":[],"fullName":"Given a csv with event data is uploaded to the transaction csv bucket stores the events we care about in the storage bucket","status":"passed","title":"stores the events we care about in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":6,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928465277,"runtime":31294,"slow":true,"start":1696928433983},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/clean-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":1896,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket and check credit field value","status":"passed","title":"should store cleaned events in the storage bucket and check credit field value"},{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":1390,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket and check credit field value","status":"passed","title":"should store cleaned events in the storage bucket and check credit field value"},{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":1437,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket and check credit field value","status":"passed","title":"should store cleaned events in the storage bucket and check credit field value"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7187,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid ComponentId in the storage bucket","status":"passed","title":"should not store event with invalid ComponentId in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7134,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid Timestamp in the storage bucket","status":"passed","title":"should not store event with invalid Timestamp in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7125,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid timestamp formatted in the storage bucket","status":"passed","title":"should not store event with invalid timestamp formatted in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928471395,"runtime":6101,"slow":true,"start":1696928465294},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-raw-store-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n"],"duration":4029,"failureMessages":[],"fullName":"\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ","status":"passed","title":"should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file "}]},{"numFailingTests":0,"numPassingTests":14,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928477902,"runtime":187421,"slow":true,"start":1696928290481},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/athena-query-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nGenerate valid event and execute athena query\n"],"duration":12925,"failureMessages":[],"fullName":"\nGenerate valid event and execute athena query\n should contain eventId in the generated query results","status":"passed","title":"should contain eventId in the generated query results"},{"ancestorTitles":["\nGenerate valid UTC+0 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":11632,"failureMessages":[],"fullName":"\nGenerate valid UTC+0 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+0 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":11651,"failureMessages":[],"fullName":"\nGenerate valid UTC+0 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+0 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":11559,"failureMessages":[],"fullName":"\nGenerate valid UTC+0 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+0 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n"],"duration":11531,"failureMessages":[],"fullName":"\nGenerate valid UTC+0 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n should contain eventId in the generated query results for February","status":"passed","title":"should contain eventId in the generated query results for February"},{"ancestorTitles":["\nGenerate valid UTC-6 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":11650,"failureMessages":[],"fullName":"\nGenerate valid UTC-6 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC-6 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":11561,"failureMessages":[],"fullName":"\nGenerate valid UTC-6 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC-6 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":11663,"failureMessages":[],"fullName":"\nGenerate valid UTC-6 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC-6 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n"],"duration":11741,"failureMessages":[],"fullName":"\nGenerate valid UTC-6 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n should contain eventId in the generated query results for February","status":"passed","title":"should contain eventId in the generated query results for February"},{"ancestorTitles":["\nGenerate valid UTC+6 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":11973,"failureMessages":[],"fullName":"\nGenerate valid UTC+6 event at one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+6 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":11676,"failureMessages":[],"fullName":"\nGenerate valid UTC+6 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+6 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n"],"duration":11769,"failureMessages":[],"fullName":"\nGenerate valid UTC+6 event at one hour and one second after midnight on 1 Oct UTC+1 and execute athena query\n should contain eventId in the generated query results for October","status":"passed","title":"should contain eventId in the generated query results for October"},{"ancestorTitles":["\nGenerate valid UTC+6 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n"],"duration":11782,"failureMessages":[],"fullName":"\nGenerate valid UTC+6 event at one second after midnight on 1 Feb UTC+0 and execute athena query\n should contain eventId in the generated query results for February","status":"passed","title":"should contain eventId in the generated query results for February"},{"ancestorTitles":["\nGenerate invalid event and execute athena query\n"],"duration":27418,"failureMessages":[],"fullName":"\nGenerate invalid event and execute athena query\n should not contain eventId in the generated query results","status":"passed","title":"should not contain eventId in the generated query results"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928480308,"runtime":15524,"slow":true,"start":1696928464784},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-lambda-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":9285,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Filter function cloud watch logs should contain eventid","status":"passed","title":"Filter function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1394,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Clean function cloud watch logs should contain eventid","status":"passed","title":"Clean function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1272,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Store Transactions function cloud watch logs should contain eventid","status":"passed","title":"Store Transactions function cloud watch logs should contain eventid"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928486477,"runtime":15075,"slow":true,"start":1696928471402},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/rate-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Execute athena query to retrieve rate details"],"duration":12810,"failureMessages":[],"fullName":"Execute athena query to retrieve rate details retrieved rate details should match rate csv uploaded in s3 config bucket","status":"passed","title":"retrieved rate details should match rate csv uploaded in s3 config bucket"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928501167,"runtime":23239,"slow":true,"start":1696928477928},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/filter-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Filter function - Happy path tests\n"],"duration":3313,"failureMessages":[],"fullName":"\n Filter function - Happy path tests\n should store event in the storage bucket for a valid event","status":"passed","title":"should store event in the storage bucket for a valid event"},{"ancestorTitles":["\n Filter Function - Unhappy path tests\n"],"duration":7239,"failureMessages":[],"fullName":"\n Filter Function - Unhappy path tests\n should not store events with invalid EventName in the storage bucket","status":"passed","title":"should not store events with invalid EventName in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928503905,"runtime":23588,"slow":true,"start":1696928480317},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve vendor service details\n"],"duration":12746,"failureMessages":[],"fullName":"\n Execute athena query to retrieve vendor service details\n retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ","status":"passed","title":"retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket "}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928523433,"runtime":105249,"slow":true,"start":1696928418184},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["New invoice with same month, vendor, service as old line item"],"duration":102995,"failureMessages":[],"fullName":"New invoice with same month, vendor, service as old line item should archive old line item","status":"passed","title":"should archive old line item"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928528499,"runtime":24100,"slow":true,"start":1696928504399},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/storage-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Store function test\n"],"duration":1681,"failureMessages":[],"fullName":"\n Store function test\n should store cleaned events in the storage bucket","status":"passed","title":"should store cleaned events in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928528545,"runtime":41745,"slow":true,"start":1696928486800},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-data-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":489,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice bucket should exists in S3","status":"passed","title":"Raw invoice bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":790,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice textract data bucket should exists in S3","status":"passed","title":"Raw invoice textract data bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":287,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Storage bucket should exists in S3","status":"passed","title":"Storage bucket should exists in S3"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928529990,"runtime":6216,"slow":true,"start":1696928523774},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-vat-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Verify VAT details exists in S3 config bucket\n"],"duration":499,"failureMessages":[],"fullName":"\n Verify VAT details exists in S3 config bucket\n S3 config bucket should contain VAT details matches with expected vat config file ","status":"passed","title":"S3 config bucket should contain VAT details matches with expected vat config file "}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1696928530995,"runtime":29698,"slow":true,"start":1696928501297},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/contract-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve contract details details\n"],"duration":10533,"failureMessages":[],"fullName":"\n Execute athena query to retrieve contract details details\n retrieved contract details should match with contract csv uploaded in s3 config bucket ","status":"passed","title":"retrieved contract details should match with contract csv uploaded in s3 config bucket "}]}],"config":{"bail":0,"changedFilesWithAncestor":false,"ci":true,"collectCoverage":false,"collectCoverageFrom":[],"coverageDirectory":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/coverage","coverageProvider":"babel","coverageReporters":["json","text","lcov","clover"],"detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"expand":false,"findRelatedTests":false,"forceExit":false,"globalSetup":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/testSetup.ts","json":false,"lastCommit":false,"listTests":false,"logHeapUsage":false,"maxConcurrency":5,"maxWorkers":4,"noStackTrace":false,"nonFlagArgs":[],"notify":false,"notifyMode":"failure-change","onlyChanged":false,"onlyFailures":false,"openHandlesTimeout":1000,"passWithNoTests":false,"projects":[],"reporters":[["default",{}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-junit/index.js",{"outputDirectory":"reports","outputName":"testReport.xml"}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-html-reporters/index.js",{"publicPath":"./reports/jest-html-reports/test-report-2023-10-10T08:54:39.445Z","filename":"index.html","expand":true,"openReport":true,"pageTitle":"BTM INTEGRATION TEST REPORT"}]],"rootDir":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring","runTestsByPath":false,"seed":-1777770227,"skipFilter":false,"snapshotFormat":{"escapeString":false,"printBasicPrototype":false},"testFailureExitCode":1,"testPathPattern":"","testSequencer":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@jest/test-sequencer/build/index.js","testTimeout":300000,"updateSnapshot":"none","useStderr":false,"verbose":true,"watch":false,"watchAll":false,"watchman":true,"workerThreads":false},"endTime":1696928532169,"_reporterOptions":{"publicPath":"./reports/jest-html-reports/test-report-2023-10-10T08:54:39.445Z","filename":"index.html","expand":true,"pageTitle":"BTM INTEGRATION TEST REPORT","hideIcon":false,"testCommand":"","openReport":true,"failureMessageOnly":0,"enableMergeData":false,"dataMergeLevel":1,"inlineSource":false,"urlForTestFiles":"","darkTheme":false,"includeConsoleLog":false},"logInfoMapping":{},"attachInfos":{}})