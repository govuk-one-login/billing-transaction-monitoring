window.jest_html_reporters_callback__({"numFailedTestSuites":1,"numFailedTests":1,"numPassedTestSuites":13,"numPassedTests":33,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":14,"numTotalTests":34,"startTime":1685621360070,"success":false,"testResults":[{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621554241,"runtime":193588,"slow":true,"start":1685621360653},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-and-transaction-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":34069,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":43272,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":30209,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":30010,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621562193,"runtime":201433,"slow":true,"start":1685621360760},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["New invoice with same month, vendor, service as old line item"],"duration":145062,"failureMessages":[],"fullName":"New invoice with same month, vendor, service as old line item should archive old line item","status":"passed","title":"should archive old line item"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621571769,"runtime":9558,"slow":true,"start":1685621562211},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Given a csv with event data is uploaded to the transaction csv bucket"],"duration":3204,"failureMessages":[],"fullName":"Given a csv with event data is uploaded to the transaction csv bucket stores the events we care about in the storage bucket","status":"passed","title":"stores the events we care about in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621575515,"runtime":214763,"slow":true,"start":1685621360752},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":27162,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":41866,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":7392,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":40880,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":40787,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621580061,"runtime":4530,"slow":false,"start":1685621575531},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-raw-store-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n"],"duration":3143,"failureMessages":[],"fullName":"\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ","status":"passed","title":"should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file "}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621588926,"runtime":8859,"slow":true,"start":1685621580067},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-lambda-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":2109,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Filter function cloud watch logs should contain eventid","status":"passed","title":"Filter function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1717,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Clean function cloud watch logs should contain eventid","status":"passed","title":"Clean function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1489,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Store Transactions function cloud watch logs should contain eventid","status":"passed","title":"Store Transactions function cloud watch logs should contain eventid"}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621603822,"runtime":32047,"slow":true,"start":1685621571775},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/events-s3-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests\n\n Generate valid event and expect event id stored in S3\n"],"duration":2111,"failureMessages":[],"fullName":"\n Happy path tests\n\n Generate valid event and expect event id stored in S3\n S3 should contain event id for the generated valid event","status":"passed","title":"S3 should contain event id for the generated valid event"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7172,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid EventName in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid EventName in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7221,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid ComponentId in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid ComponentId in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7259,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid Timestamp in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid Timestamp in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7179,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid timestamp formatted in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid timestamp formatted in the payload"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621611025,"runtime":22093,"slow":true,"start":1685621588932},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/athena-query-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nGenerate valid event and execute athena query\n"],"duration":7985,"failureMessages":[],"fullName":"\nGenerate valid event and execute athena query\n should contain eventId in the generated query results","status":"passed","title":"should contain eventId in the generated query results"},{"ancestorTitles":["\nGenerate invalid event and execute athena query\n"],"duration":12743,"failureMessages":[],"fullName":"\nGenerate invalid event and execute athena query\n should not contain eventId in the generated query results","status":"passed","title":"should not contain eventId in the generated query results"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621612210,"runtime":8383,"slow":true,"start":1685621603827},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/rate-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Execute athena query to retrieve rate details"],"duration":6455,"failureMessages":[],"fullName":"Execute athena query to retrieve rate details retrieved rate details should match rate csv uploaded in s3 config bucket","status":"passed","title":"retrieved rate details should match rate csv uploaded in s3 config bucket"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621614720,"runtime":60144,"slow":true,"start":1685621554576},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transaction-view-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":9404,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 2","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 2"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":8667,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 2","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 2"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":15571,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 7","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 7"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":24536,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 14","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 14"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621615040,"runtime":2824,"slow":false,"start":1685621612216},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-data-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":507,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice bucket should exists in S3","status":"passed","title":"Raw invoice bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":552,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice textract data bucket should exists in S3","status":"passed","title":"Raw invoice textract data bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":676,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Storage bucket should exists in S3","status":"passed","title":"Storage bucket should exists in S3"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621616441,"runtime":1714,"slow":false,"start":1685621614727},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-vat-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Verify VAT details exists in S3 config bucket\n"],"duration":543,"failureMessages":[],"fullName":"\n Verify VAT details exists in S3 config bucket\n S3 config bucket should contain VAT details matches with expected vat config file ","status":"passed","title":"S3 config bucket should contain VAT details matches with expected vat config file "}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621618664,"runtime":7632,"slow":true,"start":1685621611032},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve vendor service details\n"],"duration":6460,"failureMessages":[],"fullName":"\n Execute athena query to retrieve vendor service details\n retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ","status":"passed","title":"retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket "}]},{"numFailingTests":1,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685621745288,"runtime":384557,"slow":true,"start":1685621360731},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts","failureMessage":"\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1m\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m Happy path - Upload valid mock invoice and verify data is seen in the billing view\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m › upload valid pdf file in raw-invoice bucket and see that we can see the data in the view\u001b[39m\u001b[22m\n\n    Failed: \"address check not found\"\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 25 |\u001b[39m   \u001b[36mlet\u001b[39m filename\u001b[33m:\u001b[39m string\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 26 |\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 27 |\u001b[39m   test(\u001b[32m\"upload valid pdf file in raw-invoice bucket and see that we can see the data in the view\"\u001b[39m\u001b[33m,\u001b[39m \u001b[36masync\u001b[39m () \u001b[33m=>\u001b[39m {\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m    |\u001b[39m   \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 28 |\u001b[39m     \u001b[36mconst\u001b[39m passportCheckItems \u001b[33m=\u001b[39m randomLineItems(\u001b[35m1\u001b[39m\u001b[33m,\u001b[39m {\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 29 |\u001b[39m       description\u001b[33m:\u001b[39m \u001b[32m\"passport check\"\u001b[39m\u001b[33m,\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 30 |\u001b[39m     })\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Env.it (\u001b[22m\u001b[2mnode_modules/jest-jasmine2/build/jasmineAsyncInstall.js\u001b[2m:101:24)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Suite.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/s3-invoice-end-to-end-tests.ts\u001b[39m\u001b[0m\u001b[2m:27:3)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/s3-invoice-end-to-end-tests.ts\u001b[39m\u001b[0m\u001b[2m:24:1)\u001b[22m\u001b[2m\u001b[22m\n","testResults":[{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":280997,"failureMessages":["Error: Failed: \"address check not found\"\n    at Env.it (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:101:24)\n    at it (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/jasmineLight.js:67:21)\n    at Suite.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts:27:3)\n    at addSpecsToSuite (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/Env.js:356:49)\n    at Env.describe (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/Env.js:331:9)\n    at describe (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/jasmineLight.js:58:18)\n    at Object.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts:24:1)\n    at Runtime._execModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:1377:24)\n    at Runtime._loadModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:989:12)\n    at Runtime.requireModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:849:12)\n    at jasmine2 (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/index.js:197:13)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\n    at runTestInternal (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/testWorker.js:106:12)"],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid pdf file in raw-invoice bucket and see that we can see the data in the view","status":"failed","title":"upload valid pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":47152,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid csv file in raw-invoice bucket and check that we can see the data in the view"}]}],"config":{"bail":0,"changedFilesWithAncestor":false,"ci":true,"collectCoverage":false,"collectCoverageFrom":[],"coverageDirectory":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/coverage","coverageProvider":"babel","coverageReporters":["json","text","lcov","clover"],"detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"expand":false,"findRelatedTests":false,"forceExit":false,"globalSetup":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/testSetup.ts","json":false,"lastCommit":false,"listTests":false,"logHeapUsage":false,"maxConcurrency":5,"maxWorkers":4,"noStackTrace":false,"nonFlagArgs":[],"notify":false,"notifyMode":"failure-change","onlyChanged":false,"onlyFailures":false,"passWithNoTests":false,"projects":[],"reporters":[["default",{}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-junit/index.js",{"outputDirectory":"reports","outputName":"testReport.xml"}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-html-reporters/index.js",{"publicPath":"./reports/jest-html-reports/test-report-2023-06-01T12:08:36.583Z","filename":"index.html","expand":true,"openReport":true,"pageTitle":"BTM INTEGRATION TEST REPORT"}]],"rootDir":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring","runTestsByPath":false,"seed":-1346275307,"skipFilter":false,"snapshotFormat":{"escapeString":false,"printBasicPrototype":false},"testFailureExitCode":1,"testPathPattern":"","testSequencer":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@jest/test-sequencer/build/index.js","testTimeout":300000,"updateSnapshot":"none","useStderr":false,"verbose":true,"watch":false,"watchAll":false,"watchman":true},"endTime":1685621746117,"_reporterOptions":{"publicPath":"./reports/jest-html-reports/test-report-2023-06-01T12:08:36.583Z","filename":"index.html","expand":true,"pageTitle":"BTM INTEGRATION TEST REPORT","hideIcon":false,"testCommand":"","openReport":true,"failureMessageOnly":0,"enableMergeData":false,"dataMergeLevel":1,"inlineSource":false,"urlForTestFiles":"","darkTheme":false,"includeConsoleLog":false},"logInfoMapping":{},"attachInfos":{}})