window.jest_html_reporters_callback__({"numFailedTestSuites":2,"numFailedTests":2,"numPassedTestSuites":12,"numPassedTests":32,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":14,"numTotalTests":34,"startTime":1684308040151,"success":false,"testResults":[{"numFailingTests":1,"numPassingTests":0,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308214867,"runtime":174076,"slow":true,"start":1684308040791},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts","failureMessage":"\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mNew invoice with same month, vendor, service as old line item › should archive old line item\u001b[39m\u001b[22m\n\n    Failed: \"Given service 1 line item not found\"\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 37 |\u001b[39m   })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 38 |\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 39 |\u001b[39m   test(\u001b[32m\"should archive old line item\"\u001b[39m\u001b[33m,\u001b[39m \u001b[36masync\u001b[39m () \u001b[33m=>\u001b[39m {\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m    |\u001b[39m   \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 40 |\u001b[39m     \u001b[36mconst\u001b[39m givenDate \u001b[33m=\u001b[39m getRandomInvoiceDate()\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 41 |\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 42 |\u001b[39m     \u001b[90m// Get vendor that uses default PDF parser\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Env.it (\u001b[22m\u001b[2mnode_modules/jest-jasmine2/build/jasmineAsyncInstall.js\u001b[2m:101:24)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Suite.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/s3-invoice-standardised-line-item-tests.ts\u001b[39m\u001b[0m\u001b[2m:39:3)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/s3-invoice-standardised-line-item-tests.ts\u001b[39m\u001b[0m\u001b[2m:20:1)\u001b[22m\u001b[2m\u001b[22m\n","testResults":[{"ancestorTitles":["New invoice with same month, vendor, service as old line item"],"duration":122532,"failureMessages":["Error: Failed: \"Given service 1 line item not found\"\n    at Env.it (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:101:24)\n    at it (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/jasmineLight.js:67:21)\n    at Suite.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts:39:3)\n    at addSpecsToSuite (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/Env.js:356:49)\n    at Env.describe (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/Env.js:331:9)\n    at describe (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/jasmineLight.js:58:18)\n    at Object.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts:20:1)\n    at Runtime._execModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:1377:24)\n    at Runtime._loadModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:989:12)\n    at Runtime.requireModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:849:12)\n    at jasmine2 (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/index.js:197:13)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\n    at runTestInternal (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/testWorker.js:106:12)"],"fullName":"New invoice with same month, vendor, service as old line item should archive old line item","status":"failed","title":"should archive old line item"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308219411,"runtime":178661,"slow":true,"start":1684308040750},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n"],"duration":109776,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n upload valid pdf file in raw-invoice bucket and see that we can see the data in the view","status":"passed","title":"upload valid pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n"],"duration":17223,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n upload valid csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid csv file in raw-invoice bucket and check that we can see the data in the view"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308227271,"runtime":7844,"slow":true,"start":1684308219427},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Given a csv with event data is uploaded to the transaction csv bucket"],"duration":3395,"failureMessages":[],"fullName":"Given a csv with event data is uploaded to the transaction csv bucket stores the events we care about in the storage bucket","status":"passed","title":"stores the events we care about in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308240866,"runtime":200191,"slow":true,"start":1684308040675},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-and-transaction-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":44624,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":53851,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":30120,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":19980,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308246388,"runtime":5506,"slow":true,"start":1684308240882},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-raw-store-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n"],"duration":3366,"failureMessages":[],"fullName":"\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ","status":"passed","title":"should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file "}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308259435,"runtime":32159,"slow":true,"start":1684308227276},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/events-s3-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests\n\n Generate valid event and expect event id stored in S3\n"],"duration":2220,"failureMessages":[],"fullName":"\n Happy path tests\n\n Generate valid event and expect event id stored in S3\n S3 should contain event id for the generated valid event","status":"passed","title":"S3 should contain event id for the generated valid event"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7164,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid EventName in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid EventName in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7200,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid ComponentId in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid ComponentId in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7320,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid Timestamp in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid Timestamp in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7220,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid timestamp formatted in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid timestamp formatted in the payload"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308261489,"runtime":15094,"slow":true,"start":1684308246395},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-lambda-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":8535,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Filter function cloud watch logs should contain eventid","status":"passed","title":"Filter function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1593,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Clean function cloud watch logs should contain eventid","status":"passed","title":"Clean function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1611,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Store Transactions function cloud watch logs should contain eventid","status":"passed","title":"Store Transactions function cloud watch logs should contain eventid"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308269936,"runtime":8430,"slow":true,"start":1684308261506},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/rate-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Execute athena query to retrieve rate details"],"duration":6639,"failureMessages":[],"fullName":"Execute athena query to retrieve rate details retrieved rate details should match rate csv uploaded in s3 config bucket","status":"passed","title":"retrieved rate details should match rate csv uploaded in s3 config bucket"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308275945,"runtime":60640,"slow":true,"start":1684308215305},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transaction-view-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":9659,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 2","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 2"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":8848,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 2","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 2"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":15697,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 7","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 7"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":25030,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 14","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 14"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308277631,"runtime":7689,"slow":true,"start":1684308269942},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve vendor service details\n"],"duration":6661,"failureMessages":[],"fullName":"\n Execute athena query to retrieve vendor service details\n retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ","status":"passed","title":"retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket "}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308279176,"runtime":3212,"slow":false,"start":1684308275964},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-data-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":699,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice bucket should exists in S3","status":"passed","title":"Raw invoice bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":566,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice textract data bucket should exists in S3","status":"passed","title":"Raw invoice textract data bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":553,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Storage bucket should exists in S3","status":"passed","title":"Storage bucket should exists in S3"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308279207,"runtime":1571,"slow":false,"start":1684308277636},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-vat-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Verify VAT details exists in S3 config bucket\n"],"duration":619,"failureMessages":[],"fullName":"\n Verify VAT details exists in S3 config bucket\n S3 config bucket should contain VAT details matches with expected vat config file ","status":"passed","title":"S3 config bucket should contain VAT details matches with expected vat config file "}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308281916,"runtime":22475,"slow":true,"start":1684308259441},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/athena-query-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nGenerate valid event and execute athena query\n"],"duration":8224,"failureMessages":[],"fullName":"\nGenerate valid event and execute athena query\n should contain eventId in the generated query results","status":"passed","title":"should contain eventId in the generated query results"},{"ancestorTitles":["\nGenerate invalid event and execute athena query\n"],"duration":12730,"failureMessages":[],"fullName":"\nGenerate invalid event and execute athena query\n should not contain eventId in the generated query results","status":"passed","title":"should not contain eventId in the generated query results"}]},{"numFailingTests":1,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1684308352762,"runtime":311987,"slow":true,"start":1684308040775},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts","failureMessage":"\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1m\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \u001b[39m\u001b[22m\n\u001b[1m\u001b[31m › results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined\u001b[39m\u001b[22m\n\n    Failed: \"Query did not succeed within the given timeout\"\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 42 |\u001b[39m \u001b[32m    testCase                                                                                 | eventTime       | transactionQty | billingQty\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 43 |\u001b[39m \u001b[32m    ${\"No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice\"} | ${\"2005/12/28\"} | ${\"1\"}         | ${undefined}\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 44 |\u001b[39m \u001b[32m  `\u001b[39m(\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m    |\u001b[39m    \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 45 |\u001b[39m     \u001b[32m\"results retrieved from BillingAndTransactionsCuratedView should match with expected $testCase,$eventTime,$transactionQty,$billingQty\"\u001b[39m\u001b[33m,\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 46 |\u001b[39m     \u001b[36masync\u001b[39m (data) \u001b[33m=>\u001b[39m {\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 47 |\u001b[39m       \u001b[36mawait\u001b[39m generateTestEvents(data\u001b[33m.\u001b[39meventTime\u001b[33m,\u001b[39m data\u001b[33m.\u001b[39mtransactionQty\u001b[33m,\u001b[39m eventName)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Env.it (\u001b[22m\u001b[2mnode_modules/jest-jasmine2/build/jasmineAsyncInstall.js\u001b[2m:101:24)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m          at Array.forEach (<anonymous>)\u001b[22m\n\u001b[2m      \u001b[2mat Suite.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/e2e-tests.ts\u001b[39m\u001b[0m\u001b[2m:44:4)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/e2e-tests.ts\u001b[39m\u001b[0m\u001b[2m:28:1)\u001b[22m\u001b[2m\u001b[22m\n","testResults":[{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":57517,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":71910,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":67005,"failureMessages":["Error: Failed: \"Query did not succeed within the given timeout\"\n    at Env.it (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:101:24)\n    at it (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/jasmineLight.js:67:21)\n    at /home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-each/build/bind.js:45:15\n    at Array.forEach (<anonymous>)\n    at eachBind (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-each/build/bind.js:37:22)\n    at Suite.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts:44:4)\n    at addSpecsToSuite (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/Env.js:356:49)\n    at Env.describe (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/Env.js:331:9)\n    at describe (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/jasmineLight.js:58:18)\n    at Object.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts:28:1)\n    at Runtime._execModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:1377:24)\n    at Runtime._loadModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:989:12)\n    at Runtime.requireModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:849:12)\n    at jasmine2 (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/index.js:197:13)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\n    at runTestInternal (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/testWorker.js:106:12)"],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined","status":"failed","title":"results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":32007,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":31181,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6"}]}],"config":{"bail":0,"changedFilesWithAncestor":false,"ci":true,"collectCoverage":false,"collectCoverageFrom":[],"coverageDirectory":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/coverage","coverageProvider":"babel","coverageReporters":["json","text","lcov","clover"],"detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"expand":false,"findRelatedTests":false,"forceExit":false,"globalSetup":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/testSetup.ts","json":false,"lastCommit":false,"listTests":false,"logHeapUsage":false,"maxConcurrency":5,"maxWorkers":4,"noStackTrace":false,"nonFlagArgs":[],"notify":false,"notifyMode":"failure-change","onlyChanged":false,"onlyFailures":false,"passWithNoTests":false,"projects":[],"reporters":[["default",{}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-junit/index.js",{"outputDirectory":"reports","outputName":"testReport.xml"}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-html-reporters/index.js",{"publicPath":"./reports/jest-html-reports/test-report-2023-05-17T07:19:58.354Z","filename":"index.html","expand":true,"openReport":true,"pageTitle":"BTM INTEGRATION TEST REPORT"}]],"rootDir":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring","runTestsByPath":false,"seed":-639659425,"skipFilter":false,"snapshotFormat":{"escapeString":false,"printBasicPrototype":false},"testFailureExitCode":1,"testPathPattern":"","testSequencer":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@jest/test-sequencer/build/index.js","testTimeout":1600000,"updateSnapshot":"none","useStderr":false,"verbose":true,"watch":false,"watchAll":false,"watchman":true},"endTime":1684308353564,"_reporterOptions":{"publicPath":"./reports/jest-html-reports/test-report-2023-05-17T07:19:58.354Z","filename":"index.html","expand":true,"pageTitle":"BTM INTEGRATION TEST REPORT","hideIcon":false,"testCommand":"","openReport":true,"failureMessageOnly":0,"enableMergeData":false,"dataMergeLevel":1,"inlineSource":false,"urlForTestFiles":"","darkTheme":false,"includeConsoleLog":false},"logInfoMapping":{},"attachInfos":{}})