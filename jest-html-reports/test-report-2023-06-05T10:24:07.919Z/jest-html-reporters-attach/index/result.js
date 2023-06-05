window.jest_html_reporters_callback__({"numFailedTestSuites":1,"numFailedTests":1,"numPassedTestSuites":13,"numPassedTests":33,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":14,"numTotalTests":34,"startTime":1685960697557,"success":false,"testResults":[{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960902524,"runtime":204265,"slow":true,"start":1685960698259},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-and-transaction-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":33105,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":44487,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":30547,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":31093,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960910053,"runtime":211710,"slow":true,"start":1685960698343},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["New invoice with same month, vendor, service as old line item"],"duration":146240,"failureMessages":[],"fullName":"New invoice with same month, vendor, service as old line item should archive old line item","status":"passed","title":"should archive old line item"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960921035,"runtime":10957,"slow":true,"start":1685960910078},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Given a csv with event data is uploaded to the transaction csv bucket"],"duration":3891,"failureMessages":[],"fullName":"Given a csv with event data is uploaded to the transaction csv bucket stores the events we care about in the storage bucket","status":"passed","title":"stores the events we care about in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960921302,"runtime":222979,"slow":true,"start":1685960698323},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":109961,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid pdf file in raw-invoice bucket and see that we can see the data in the view","status":"passed","title":"upload valid pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n"],"duration":47429,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice and verify data is seen in the billing view\n upload valid csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid csv file in raw-invoice bucket and check that we can see the data in the view"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960929545,"runtime":8172,"slow":true,"start":1685960921373},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-raw-store-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n"],"duration":5517,"failureMessages":[],"fullName":"\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ","status":"passed","title":"should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file "}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960939757,"runtime":10199,"slow":true,"start":1685960929558},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-lambda-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":2091,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Filter function cloud watch logs should contain eventid","status":"passed","title":"Filter function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1799,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Clean function cloud watch logs should contain eventid","status":"passed","title":"Clean function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1595,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Store Transactions function cloud watch logs should contain eventid","status":"passed","title":"Store Transactions function cloud watch logs should contain eventid"}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960954887,"runtime":33843,"slow":true,"start":1685960921044},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/events-s3-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests\n\n Generate valid event and expect event id stored in S3\n"],"duration":2422,"failureMessages":[],"fullName":"\n Happy path tests\n\n Generate valid event and expect event id stored in S3\n S3 should contain event id for the generated valid event","status":"passed","title":"S3 should contain event id for the generated valid event"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7191,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid EventName in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid EventName in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7259,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid ComponentId in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid ComponentId in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7301,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid Timestamp in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid Timestamp in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7298,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid timestamp formatted in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid timestamp formatted in the payload"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960963406,"runtime":23640,"slow":true,"start":1685960939766},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/athena-query-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nGenerate valid event and execute athena query\n"],"duration":8503,"failureMessages":[],"fullName":"\nGenerate valid event and execute athena query\n should contain eventId in the generated query results","status":"passed","title":"should contain eventId in the generated query results"},{"ancestorTitles":["\nGenerate invalid event and execute athena query\n"],"duration":13018,"failureMessages":[],"fullName":"\nGenerate invalid event and execute athena query\n should not contain eventId in the generated query results","status":"passed","title":"should not contain eventId in the generated query results"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960963988,"runtime":9091,"slow":true,"start":1685960954897},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/rate-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Execute athena query to retrieve rate details"],"duration":6642,"failureMessages":[],"fullName":"Execute athena query to retrieve rate details retrieved rate details should match rate csv uploaded in s3 config bucket","status":"passed","title":"retrieved rate details should match rate csv uploaded in s3 config bucket"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960966467,"runtime":63239,"slow":true,"start":1685960903228},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transaction-view-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":9832,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 2","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 2"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":9054,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 2","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 2"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":15969,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 7","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 7"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":25983,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 14","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 14"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960967483,"runtime":3489,"slow":false,"start":1685960963994},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-data-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":719,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice bucket should exists in S3","status":"passed","title":"Raw invoice bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":626,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice textract data bucket should exists in S3","status":"passed","title":"Raw invoice textract data bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":650,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Storage bucket should exists in S3","status":"passed","title":"Storage bucket should exists in S3"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960969416,"runtime":2923,"slow":false,"start":1685960966493},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-vat-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Verify VAT details exists in S3 config bucket\n"],"duration":728,"failureMessages":[],"fullName":"\n Verify VAT details exists in S3 config bucket\n S3 config bucket should contain VAT details matches with expected vat config file ","status":"passed","title":"S3 config bucket should contain VAT details matches with expected vat config file "}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685960971627,"runtime":8213,"slow":true,"start":1685960963414},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve vendor service details\n"],"duration":6695,"failureMessages":[],"fullName":"\n Execute athena query to retrieve vendor service details\n retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ","status":"passed","title":"retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket "}]},{"numFailingTests":1,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1685961180702,"runtime":482394,"slow":true,"start":1685960698308},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts","failureMessage":"\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1m\u001b[39m\u001b[22m\n\u001b[1m\u001b[31m Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \u001b[39m\u001b[22m\n\u001b[1m\u001b[31m › results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100\u001b[39m\u001b[22m\n\n    Failed: \"Fraud check not found\"\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 31 |\u001b[39m \u001b[32m    ${\"No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price\"} | ${\"2006/01/30\"} | ${undefined}   | ${\"100\"}\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 32 |\u001b[39m \u001b[32m    ${\"BillingQty BillingPrice equals TransactionQty and TransactionPrice\"}                | ${\"2005/09/30\"} | ${\"10\"}        | ${\"10\"}\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 33 |\u001b[39m \u001b[32m  `\u001b[39m(\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m    |\u001b[39m    \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 34 |\u001b[39m     \u001b[32m\"results retrieved from BillingAndTransactionsCuratedView view should match with expected $testCase,$eventTime,$transactionQty,$billingQty\"\u001b[39m\u001b[33m,\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 35 |\u001b[39m     \u001b[36masync\u001b[39m (data) \u001b[33m=>\u001b[39m {\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 36 |\u001b[39m       \u001b[36mawait\u001b[39m generateTestEvents(data\u001b[33m.\u001b[39meventTime\u001b[33m,\u001b[39m data\u001b[33m.\u001b[39mtransactionQty\u001b[33m,\u001b[39m eventName)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Env.it (\u001b[22m\u001b[2mnode_modules/jest-jasmine2/build/jasmineAsyncInstall.js\u001b[2m:101:24)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m          at Array.forEach (<anonymous>)\u001b[22m\n\u001b[2m      \u001b[2mat Suite.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/e2e-tests.ts\u001b[39m\u001b[0m\u001b[2m:33:4)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/e2e-tests.ts\u001b[39m\u001b[0m\u001b[2m:28:1)\u001b[22m\u001b[2m\u001b[22m\n","testResults":[{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":281003,"failureMessages":["Error: Failed: \"Fraud check not found\"\n    at Env.it (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:101:24)\n    at it (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/jasmineLight.js:67:21)\n    at /home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-each/build/bind.js:45:15\n    at Array.forEach (<anonymous>)\n    at eachBind (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-each/build/bind.js:37:22)\n    at Suite.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts:33:4)\n    at addSpecsToSuite (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/Env.js:356:49)\n    at Env.describe (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/Env.js:331:9)\n    at describe (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/jasmine/jasmineLight.js:58:18)\n    at Object.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts:28:1)\n    at Runtime._execModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:1377:24)\n    at Runtime._loadModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:989:12)\n    at Runtime.requireModule (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runtime/build/index.js:849:12)\n    at jasmine2 (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-jasmine2/build/index.js:197:13)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\n    at runTestInternal (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/runTest.js:367:16)\n    at runTest (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/runTest.js:444:34)\n    at Object.worker (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-runner/build/testWorker.js:106:12)"],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100","status":"failed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2006/01/30,undefined,100"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":43049,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2005/09/30,10,10"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":7667,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2005/12/28,1,undefined"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":42248,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2005/10/30,10,12"},{"ancestorTitles":["\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":42148,"failureMessages":[],"fullName":"\n Upload csv invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2005/11/30,10,6"}]}],"config":{"bail":0,"changedFilesWithAncestor":false,"ci":true,"collectCoverage":false,"collectCoverageFrom":[],"coverageDirectory":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/coverage","coverageProvider":"babel","coverageReporters":["json","text","lcov","clover"],"detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"expand":false,"findRelatedTests":false,"forceExit":false,"globalSetup":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/testSetup.ts","json":false,"lastCommit":false,"listTests":false,"logHeapUsage":false,"maxConcurrency":5,"maxWorkers":4,"noStackTrace":false,"nonFlagArgs":[],"notify":false,"notifyMode":"failure-change","onlyChanged":false,"onlyFailures":false,"passWithNoTests":false,"projects":[],"reporters":[["default",{}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-junit/index.js",{"outputDirectory":"reports","outputName":"testReport.xml"}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-html-reporters/index.js",{"publicPath":"./reports/jest-html-reports/test-report-2023-06-05T10:24:07.919Z","filename":"index.html","expand":true,"openReport":true,"pageTitle":"BTM INTEGRATION TEST REPORT"}]],"rootDir":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring","runTestsByPath":false,"seed":1899553077,"skipFilter":false,"snapshotFormat":{"escapeString":false,"printBasicPrototype":false},"testFailureExitCode":1,"testPathPattern":"","testSequencer":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@jest/test-sequencer/build/index.js","testTimeout":300000,"updateSnapshot":"none","useStderr":false,"verbose":true,"watch":false,"watchAll":false,"watchman":true},"endTime":1685961182030,"_reporterOptions":{"publicPath":"./reports/jest-html-reports/test-report-2023-06-05T10:24:07.919Z","filename":"index.html","expand":true,"pageTitle":"BTM INTEGRATION TEST REPORT","hideIcon":false,"testCommand":"","openReport":true,"failureMessageOnly":0,"enableMergeData":false,"dataMergeLevel":1,"inlineSource":false,"urlForTestFiles":"","darkTheme":false,"includeConsoleLog":false},"logInfoMapping":{},"attachInfos":{}})