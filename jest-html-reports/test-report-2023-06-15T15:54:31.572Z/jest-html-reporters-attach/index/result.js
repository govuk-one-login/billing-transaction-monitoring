window.jest_html_reporters_callback__({"numFailedTestSuites":1,"numFailedTests":2,"numPassedTestSuites":16,"numPassedTests":35,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":17,"numTotalTests":37,"startTime":1686844503251,"success":false,"testResults":[{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844686176,"runtime":182240,"slow":true,"start":1686844503936},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["New invoice with same month, vendor, service as old line item"],"duration":126288,"failureMessages":[],"fullName":"New invoice with same month, vendor, service as old line item should archive old line item","status":"passed","title":"should archive old line item"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844721571,"runtime":217791,"slow":true,"start":1686844503780},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-and-transaction-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":40658,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":50035,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":35393,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":35376,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844740947,"runtime":54630,"slow":true,"start":1686844686317},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transaction-view-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":12445,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_1_EVENT_1, vendor_testvendor1, 2, 2005/06/30 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_1_EVENT_1, vendor_testvendor1, 2, 2005/06/30 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":12400,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_2_EVENT_2, vendor_testvendor2, 2, 2005/07/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_2_EVENT_2, vendor_testvendor2, 2, 2005/07/10 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13882,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_4, vendor_testvendor3, 7, 2005/08/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_4, vendor_testvendor3, 7, 2005/08/10 10:00"},{"ancestorTitles":["\nUpload events to s3 directly and check the transaction curated view \n"],"duration":13906,"failureMessages":[],"fullName":"\nUpload events to s3 directly and check the transaction curated view \n data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_6, vendor_testvendor3, 14, 2005/09/10 10:00","status":"passed","title":"data retrieved from transaction_curated athena view should match the input data VENDOR_3_EVENT_6, vendor_testvendor3, 14, 2005/09/10 10:00"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844745498,"runtime":23910,"slow":true,"start":1686844721588},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-curated-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload invoice standardised data to s3 directly and check the billing curated view"],"duration":22495,"failureMessages":[],"fullName":"\n Upload invoice standardised data to s3 directly and check the billing curated view Uploaded invoice standardised data should match the results from billing curated view","status":"passed","title":"Uploaded invoice standardised data should match the results from billing curated view"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844751418,"runtime":10461,"slow":true,"start":1686844740957},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Given a csv with event data is uploaded to the transaction csv bucket"],"duration":3874,"failureMessages":[],"fullName":"Given a csv with event data is uploaded to the transaction csv bucket stores the events we care about in the storage bucket","status":"passed","title":"stores the events we care about in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844753234,"runtime":7730,"slow":true,"start":1686844745504},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-raw-store-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n"],"duration":6540,"failureMessages":[],"fullName":"\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ","status":"passed","title":"should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file "}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844767844,"runtime":16420,"slow":true,"start":1686844751424},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-lambda-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":8562,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Filter function cloud watch logs should contain eventid","status":"passed","title":"Filter function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1625,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Clean function cloud watch logs should contain eventid","status":"passed","title":"Clean function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1472,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Store Transactions function cloud watch logs should contain eventid","status":"passed","title":"Store Transactions function cloud watch logs should contain eventid"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844779644,"runtime":26403,"slow":true,"start":1686844753241},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/clean-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Clean Function - Happy path tests\n"],"duration":2409,"failureMessages":[],"fullName":"\n Clean Function - Happy path tests\n should store cleaned events in the storage bucket","status":"passed","title":"should store cleaned events in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7272,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid ComponentId in the storage bucket","status":"passed","title":"should not store event with invalid ComponentId in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7230,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid Timestamp in the storage bucket","status":"passed","title":"should not store event with invalid Timestamp in the storage bucket"},{"ancestorTitles":["\n Clean Function - Unhappy path tests\n"],"duration":7200,"failureMessages":[],"fullName":"\n Clean Function - Unhappy path tests\n should not store event with invalid timestamp formatted in the storage bucket","status":"passed","title":"should not store event with invalid timestamp formatted in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844780051,"runtime":12201,"slow":true,"start":1686844767850},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/rate-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Execute athena query to retrieve rate details"],"duration":11069,"failureMessages":[],"fullName":"Execute athena query to retrieve rate details retrieved rate details should match rate csv uploaded in s3 config bucket","status":"passed","title":"retrieved rate details should match rate csv uploaded in s3 config bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844792340,"runtime":12275,"slow":true,"start":1686844780065},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve vendor service details\n"],"duration":11052,"failureMessages":[],"fullName":"\n Execute athena query to retrieve vendor service details\n retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ","status":"passed","title":"retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket "}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844802973,"runtime":10627,"slow":true,"start":1686844792346},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/filter-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Filter function - Happy path tests\n"],"duration":2343,"failureMessages":[],"fullName":"\n Filter function - Happy path tests\n should store event in the storage bucket for a valid event","status":"passed","title":"should store event in the storage bucket for a valid event"},{"ancestorTitles":["\n Filter Function - Unhappy path tests\n"],"duration":7246,"failureMessages":[],"fullName":"\n Filter Function - Unhappy path tests\n should not store events with invalid EventName in the storage bucket","status":"passed","title":"should not store events with invalid EventName in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844805954,"runtime":302052,"slow":true,"start":1686844503902},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":91990,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":47164,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":12763,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":46540,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":46774,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844806144,"runtime":3156,"slow":false,"start":1686844802988},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-data-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":662,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice bucket should exists in S3","status":"passed","title":"Raw invoice bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":627,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice textract data bucket should exists in S3","status":"passed","title":"Raw invoice textract data bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":809,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Storage bucket should exists in S3","status":"passed","title":"Storage bucket should exists in S3"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844808584,"runtime":2418,"slow":false,"start":1686844806166},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-vat-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Verify VAT details exists in S3 config bucket\n"],"duration":788,"failureMessages":[],"fullName":"\n Verify VAT details exists in S3 config bucket\n S3 config bucket should contain VAT details matches with expected vat config file ","status":"passed","title":"S3 config bucket should contain VAT details matches with expected vat config file "}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844811333,"runtime":31681,"slow":true,"start":1686844779652},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/athena-query-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nGenerate valid event and execute athena query\n"],"duration":12818,"failureMessages":[],"fullName":"\nGenerate valid event and execute athena query\n should contain eventId in the generated query results","status":"passed","title":"should contain eventId in the generated query results"},{"ancestorTitles":["\nGenerate invalid event and execute athena query\n"],"duration":17685,"failureMessages":[],"fullName":"\nGenerate invalid event and execute athena query\n should not contain eventId in the generated query results","status":"passed","title":"should not contain eventId in the generated query results"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844812307,"runtime":6207,"slow":true,"start":1686844806100},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/storage-function-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Store function test\n"],"duration":2416,"failureMessages":[],"fullName":"\n Store function test\n should store cleaned events in the storage bucket","status":"passed","title":"should store cleaned events in the storage bucket"}]},{"numFailingTests":2,"numPassingTests":0,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1686844873121,"runtime":369193,"slow":true,"start":1686844503928},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts","failureMessage":"\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1m\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m Happy path - Upload valid mock invoice and verify data is seen in the billing view\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m › upload valid pdf file in raw-invoice bucket and see that we can see the data in the view\u001b[39m\u001b[22m\n\n    Failed: \"Item: address check prefix:btm_invoice_data/2023/03/2023-03-vendor_testvendor3-VENDOR_3_EVENT_6- not found\"\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 25 |\u001b[39m   \u001b[36mlet\u001b[39m filename\u001b[33m:\u001b[39m string\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 26 |\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 27 |\u001b[39m   test(\u001b[32m\"upload valid pdf file in raw-invoice bucket and see that we can see the data in the view\"\u001b[39m\u001b[33m,\u001b[39m \u001b[36masync\u001b[39m () \u001b[33m=>\u001b[39m {\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m    |\u001b[39m   \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 28 |\u001b[39m     \u001b[36mconst\u001b[39m passportCheckItems \u001b[33m=\u001b[39m randomLineItems(\u001b[35m1\u001b[39m\u001b[33m,\u001b[39m {\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 29 |\u001b[39m       description\u001b[33m:\u001b[39m \u001b[32m\"passport check\"\u001b[39m\u001b[33m,\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 30 |\u001b[39m     })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Env.it (\u001b[22m\u001b[2mnode_modules/jest-jasmine2/build/jasmineAsyncInstall.js\u001b[2m:101:24)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Suite.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/s3-invoice-end-to-end-tests.ts\u001b[39m\u001b[0m\u001b[2m:27:3)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/s3-invoice-end-to-end-tests.ts\u001b[39m\u001b[0m\u001b[2m:24:1)\u001b[22m\u001b[2m\u001b[22m\n\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1m\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m Happy path - Upload valid mock invoice and verify data is seen in the billing view\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m › upload valid csv file in raw-invoice bucket and check that we can see the data in the view\u001b[39m\u001b[22m\n\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoEqual\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // deep equality\u001b[22m\n\n    Expected: \u001b[32m\"C01234\"\u001b[39m\n    Received: \u001b[31mundefined\u001b[39m\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 185 |\u001b[39m     expect(response[\u001b[35m0\u001b[39m]\u001b[33m.\u001b[39mvendor_name)\u001b[33m.\u001b[39mtoEqual(invoice\u001b[33m.\u001b[39mvendor\u001b[33m.\u001b[39mname)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 186 |\u001b[39m     expect(response[\u001b[35m0\u001b[39m]\u001b[33m.\u001b[39mservice_name)\u001b[33m.\u001b[39mtoEqual(\u001b[32m\"Fraud check\"\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 187 |\u001b[39m     expect(response[\u001b[35m0\u001b[39m]\u001b[33m.\u001b[39mcontract_name)\u001b[33m.\u001b[39mtoEqual(\u001b[32m\"C01234\"\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m     |\u001b[39m                                       \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 188 |\u001b[39m     expect(response[\u001b[35m0\u001b[39m]\u001b[33m.\u001b[39mquantity)\u001b[33m.\u001b[39mtoEqual(\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 189 |\u001b[39m       invoice\u001b[33m.\u001b[39mgetQuantity(\u001b[32m\"Fraud check\"\u001b[39m)\u001b[33m.\u001b[39mtoString()\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 190 |\u001b[39m     )\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/s3-invoice-end-to-end-tests.ts\u001b[39m\u001b[0m\u001b[2m:187:39)\u001b[22m\u001b[2m\u001b[22m\n","testResults":[{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":281159,"failureMessages":["Error: Failed: \"Item: address check prefix:btm_invoice_data/2023/03/2023-03-vendor_testvendor3-VENDOR_3_EVENT_6- not found\"\n    at Env.it (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:101:24)\n    at it (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/jasmineLight.js:67:21)\n    at Suite.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts:27:3)\n    at addSpecsToSuite (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/Env.js:356:49)\n    at Env.describe (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/Env.js:331:9)\n    at describe (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/jasmineLight.js:58:18)\n    at Object.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts:24:1)\n    at Runtime._execModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:1377:24)\n    at Runtime._loadModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:989:12)\n    at Runtime.requireModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:849:12)\n    at jasmine2 (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/index.js:197:13)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\n    at runTestInternal (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/testWorker.js:106:12)"],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid pdf file in raw-invoice bucket and see that we can see the data in the view","status":"failed","title":"upload valid pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":31897,"failureMessages":["Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoEqual\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // deep equality\u001b[22m\n\nExpected: \u001b[32m\"C01234\"\u001b[39m\nReceived: \u001b[31mundefined\u001b[39m\n    at Object.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts:187:39)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid csv file in raw-invoice bucket and check that we can see the data in the view","status":"failed","title":"upload valid csv file in raw-invoice bucket and check that we can see the data in the view"}]}],"config":{"bail":0,"changedFilesWithAncestor":false,"ci":true,"collectCoverage":false,"collectCoverageFrom":[],"coverageDirectory":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/coverage","coverageProvider":"babel","coverageReporters":["json","text","lcov","clover"],"detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"expand":false,"findRelatedTests":false,"forceExit":false,"globalSetup":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/testSetup.ts","json":false,"lastCommit":false,"listTests":false,"logHeapUsage":false,"maxConcurrency":5,"maxWorkers":4,"noStackTrace":false,"nonFlagArgs":[],"notify":false,"notifyMode":"failure-change","onlyChanged":false,"onlyFailures":false,"passWithNoTests":false,"projects":[],"reporters":[["default",{}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-junit/index.js",{"outputDirectory":"reports","outputName":"testReport.xml"}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-html-reporters/index.js",{"publicPath":"./reports/jest-html-reports/test-report-2023-06-15T15:54:31.572Z","filename":"index.html","expand":true,"openReport":true,"pageTitle":"BTM INTEGRATION TEST REPORT"}]],"rootDir":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring","runTestsByPath":false,"seed":-1250174211,"skipFilter":false,"snapshotFormat":{"escapeString":false,"printBasicPrototype":false},"testFailureExitCode":1,"testPathPattern":"","testSequencer":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@jest/test-sequencer/build/index.js","testTimeout":300000,"updateSnapshot":"none","useStderr":false,"verbose":true,"watch":false,"watchAll":false,"watchman":true},"endTime":1686844873914,"_reporterOptions":{"publicPath":"./reports/jest-html-reports/test-report-2023-06-15T15:54:31.572Z","filename":"index.html","expand":true,"pageTitle":"BTM INTEGRATION TEST REPORT","hideIcon":false,"testCommand":"","openReport":true,"failureMessageOnly":0,"enableMergeData":false,"dataMergeLevel":1,"inlineSource":false,"urlForTestFiles":"","darkTheme":false,"includeConsoleLog":false},"logInfoMapping":{},"attachInfos":{}})