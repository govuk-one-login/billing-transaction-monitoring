window.jest_html_reporters_callback__({"numFailedTestSuites":1,"numFailedTests":1,"numPassedTestSuites":13,"numPassedTests":33,"numPendingTestSuites":0,"numPendingTests":0,"numRuntimeErrorTestSuites":0,"numTodoTests":0,"numTotalTestSuites":14,"numTotalTests":34,"startTime":1682351668590,"success":false,"testResults":[{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351806485,"runtime":137184,"slow":true,"start":1682351669301},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-standardised-line-item-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["New invoice with same month, vendor, service as old line item"],"duration":84837,"failureMessages":[],"fullName":"New invoice with same month, vendor, service as old line item should archive old line item","status":"passed","title":"should archive old line item"}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351817275,"runtime":148078,"slow":true,"start":1682351669197},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/billing-and-transaction-view-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":24057,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty and No TransactionPrice No BillingPrice ,2,£0.00,2,£0.00,-1234567.01"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":31971,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty less than TransactionQty and No BillingPrice but has TransactionPrice ,2,£0.00,11,£27.50,-100.0"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":19722,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty greater than TransactionQty and No TransactionPrice but has BillingPrice,11,£27.50,2,£0.00,undefined"},{"ancestorTitles":["\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n"],"duration":19811,"failureMessages":[],"fullName":"\nUpload pdf invoice to raw invoice bucket and verify BillingAndTransactionsCuratedView results matches with expected data \n results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317","status":"passed","title":"results retrieved from billing and transaction_curated view query should match with expected BillingQty equals TransactionQty but BillingPrice greater than TransactionPrice,2,£6.66,2,£2.46,170.7317"}]},{"numFailingTests":1,"numPassingTests":0,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351821575,"runtime":4283,"slow":false,"start":1682351817292},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts","failureMessage":"\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mGiven a csv with event data is uploaded to the transaction csv bucket › stores the events we care about in the storage bucket\u001b[39m\u001b[22m\n\n    AWS SDK error wrapper for TimeoutError: read ECONNRESET\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 50 |\u001b[39m     \u001b[33mPrefix\u001b[39m\u001b[33m:\u001b[39m params\u001b[33m.\u001b[39mprefix\u001b[33m,\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 51 |\u001b[39m   }\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 52 |\u001b[39m   \u001b[36mreturn\u001b[39m \u001b[36mawait\u001b[39m s3Client\u001b[33m.\u001b[39msend(\u001b[36mnew\u001b[39m \u001b[33mListObjectsCommand\u001b[39m(bucketParams))\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m    |\u001b[39m          \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 53 |\u001b[39m }\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 54 |\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 55 |\u001b[39m \u001b[36mconst\u001b[39m listS3Objects \u001b[33m=\u001b[39m callWithRetryAndTimeout(listS3ObjectsBasic)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat asSdkError (\u001b[22m\u001b[2mnode_modules/@aws-sdk/middleware-retry/dist-cjs/StandardRetryStrategy.js\u001b[2m:103:12)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat StandardRetryStrategy.retry (\u001b[22m\u001b[2mnode_modules/@aws-sdk/middleware-retry/dist-cjs/StandardRetryStrategy.js\u001b[2m:61:29)\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat \u001b[22m\u001b[2mnode_modules/@aws-sdk/middleware-logger/dist-cjs/loggerMiddleware.js\u001b[2m:6:22\u001b[22m\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat listS3ObjectsBasic (\u001b[22m\u001b[2msrc/handlers/int-test-support/helpers/s3Helper.ts\u001b[2m:52:10)\u001b[22m\u001b[2m\u001b[22m\n\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[22m\u001b[1mGiven a csv with event data is uploaded to the transaction csv bucket › stores the events we care about in the storage bucket\u001b[39m\u001b[22m\n\n    No event was made for a happy path\n\u001b[2m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 56 |\u001b[39m         \u001b[36mcase\u001b[39m \u001b[32m\"happy\"\u001b[39m\u001b[33m:\u001b[39m {\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 57 |\u001b[39m           \u001b[36mif\u001b[39m (s3Object \u001b[33m===\u001b[39m undefined \u001b[33m||\u001b[39m s3Object \u001b[33m===\u001b[39m \u001b[32m\"NoSuchKey\"\u001b[39m)\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[2m\u001b[39m\u001b[90m 58 |\u001b[39m             \u001b[36mthrow\u001b[39m \u001b[36mnew\u001b[39m \u001b[33mError\u001b[39m(\u001b[32m\"No event was made for a happy path\"\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m    |\u001b[39m                   \u001b[31m\u001b[1m^\u001b[22m\u001b[2m\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 59 |\u001b[39m           \u001b[36mconst\u001b[39m s3Event \u001b[33m=\u001b[39m \u001b[33mJSON\u001b[39m\u001b[33m.\u001b[39mparse(s3Object)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 60 |\u001b[39m           expect(s3Event\u001b[33m.\u001b[39mvendor_id)\u001b[33m.\u001b[39mtoEqual(testCase\u001b[33m.\u001b[39mexpectedVendorId)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m    \u001b[0m \u001b[90m 61 |\u001b[39m           expect(s3Event\u001b[33m.\u001b[39mevent_id)\u001b[33m.\u001b[39mtoEqual(testCase\u001b[33m.\u001b[39mexpectedEventId)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\n\u001b[2m\u001b[22m\n\u001b[2m      \u001b[2mat Object.<anonymous> (\u001b[22m\u001b[2m\u001b[0m\u001b[36mintegration_tests/tests/transactionCSV-to-s3-event-tests.ts\u001b[39m\u001b[0m\u001b[2m:58:19)\u001b[22m\u001b[2m\u001b[22m\n","testResults":[{"ancestorTitles":["Given a csv with event data is uploaded to the transaction csv bucket"],"duration":477,"failureMessages":["Error: AWS SDK error wrapper for TimeoutError: read ECONNRESET\n    at asSdkError (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@aws-sdk/middleware-retry/dist-cjs/StandardRetryStrategy.js:103:12)\n    at StandardRetryStrategy.retry (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@aws-sdk/middleware-retry/dist-cjs/StandardRetryStrategy.js:61:29)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\n    at /home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@aws-sdk/middleware-logger/dist-cjs/loggerMiddleware.js:6:22\n    at listS3ObjectsBasic (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/s3Helper.ts:52:10)","Error: No event was made for a happy path\n    at Object.<anonymous> (/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transactionCSV-to-s3-event-tests.ts:58:19)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"],"fullName":"Given a csv with event data is uploaded to the transaction csv bucket stores the events we care about in the storage bucket","status":"failed","title":"stores the events we care about in the storage bucket"}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351853950,"runtime":32363,"slow":true,"start":1682351821587},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/events-s3-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests\n\n Generate valid event and expect event id stored in S3\n"],"duration":2057,"failureMessages":[],"fullName":"\n Happy path tests\n\n Generate valid event and expect event id stored in S3\n S3 should contain event id for the generated valid event","status":"passed","title":"S3 should contain event id for the generated valid event"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7147,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid EventName in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid EventName in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7252,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid ComponentId in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid ComponentId in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7179,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid Timestamp in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid Timestamp in the payload"},{"ancestorTitles":["\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n"],"duration":7260,"failureMessages":[],"fullName":"\nUnhappy path tests\n\n Generate invalid event and expect event id not stored in S3\n S3 should not contain event id for event payload which has invalid timestamp formatted in the payload","status":"passed","title":"S3 should not contain event id for event payload which has invalid timestamp formatted in the payload"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351860415,"runtime":6453,"slow":true,"start":1682351853962},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-raw-store-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n"],"duration":4070,"failureMessages":[],"fullName":"\n Unhappy path - Upload invalid pdf to the raw invoice bucket test\n should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file ","status":"passed","title":"should move the original raw invoice to failed folder in s3 raw-invoice bucket upon uploading the invalid pdf file "}]},{"numFailingTests":0,"numPassingTests":4,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351867151,"runtime":60306,"slow":true,"start":1682351806845},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/transaction-view-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":9577,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 2","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 2"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":9136,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 2","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 2"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":15171,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 7","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 7"},{"ancestorTitles":["\nExecute athena transaction curated query to retrieve price \n"],"duration":24960,"failureMessages":[],"fullName":"\nExecute athena transaction curated query to retrieve price \n price retrieved from transaction_curated athena view query should match with expected calculated price for 14","status":"passed","title":"price retrieved from transaction_curated athena view query should match with expected calculated price for 14"}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351870677,"runtime":201365,"slow":true,"start":1682351669312},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-end-to-end-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n"],"duration":109152,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n upload valid pdf file in raw-invoice bucket and see that we can see the data in the view","status":"passed","title":"upload valid pdf file in raw-invoice bucket and see that we can see the data in the view"},{"ancestorTitles":["\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n"],"duration":39426,"failureMessages":[],"fullName":"\n Happy path - Upload valid mock invoice pdf and verify data is seen in the billing view\n upload valid csv file in raw-invoice bucket and check that we can see the data in the view","status":"passed","title":"upload valid csv file in raw-invoice bucket and check that we can see the data in the view"}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351873862,"runtime":13438,"slow":true,"start":1682351860424},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-lambda-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1891,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Filter function cloud watch logs should contain eventid","status":"passed","title":"Filter function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":6458,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Clean function cloud watch logs should contain eventid","status":"passed","title":"Clean function cloud watch logs should contain eventid"},{"ancestorTitles":["\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n"],"duration":1616,"failureMessages":[],"fullName":"\n Happy path tests \n\n Generate valid event and check cloud watch logs lambda functions Filter,Clean, Store Transactions contains eventId\n Store Transactions function cloud watch logs should contain eventid","status":"passed","title":"Store Transactions function cloud watch logs should contain eventid"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351878759,"runtime":8045,"slow":true,"start":1682351870714},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/rate-table-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["Execute athena query to retrieve rate details"],"duration":6504,"failureMessages":[],"fullName":"Execute athena query to retrieve rate details retrieved rate details should match rate csv uploaded in s3 config bucket","status":"passed","title":"retrieved rate details should match rate csv uploaded in s3 config bucket"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351881299,"runtime":7426,"slow":true,"start":1682351873873},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/vendor-service-athena-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Execute athena query to retrieve vendor service details\n"],"duration":6366,"failureMessages":[],"fullName":"\n Execute athena query to retrieve vendor service details\n retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ","status":"passed","title":"retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket "}]},{"numFailingTests":0,"numPassingTests":3,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351882205,"runtime":3438,"slow":false,"start":1682351878767},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-invoice-data-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":607,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice bucket should exists in S3","status":"passed","title":"Raw invoice bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":611,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Raw invoice textract data bucket should exists in S3","status":"passed","title":"Raw invoice textract data bucket should exists in S3"},{"ancestorTitles":["\n Invoice data buckets exists in S3\n"],"duration":1080,"failureMessages":[],"fullName":"\n Invoice data buckets exists in S3\n Storage bucket should exists in S3","status":"passed","title":"Storage bucket should exists in S3"}]},{"numFailingTests":0,"numPassingTests":1,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351882857,"runtime":1552,"slow":false,"start":1682351881305},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/s3-vat-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Verify VAT details exists in S3 config bucket\n"],"duration":490,"failureMessages":[],"fullName":"\n Verify VAT details exists in S3 config bucket\n S3 config bucket should contain VAT details matches with expected vat config file ","status":"passed","title":"S3 config bucket should contain VAT details matches with expected vat config file "}]},{"numFailingTests":0,"numPassingTests":2,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351889150,"runtime":21985,"slow":true,"start":1682351867165},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/athena-query-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\nGenerate valid event and execute athena query\n"],"duration":8047,"failureMessages":[],"fullName":"\nGenerate valid event and execute athena query\n should contain eventId in the generated query results","status":"passed","title":"should contain eventId in the generated query results"},{"ancestorTitles":["\nGenerate invalid event and execute athena query\n"],"duration":12695,"failureMessages":[],"fullName":"\nGenerate invalid event and execute athena query\n should not contain eventId in the generated query results","status":"passed","title":"should not contain eventId in the generated query results"}]},{"numFailingTests":0,"numPassingTests":5,"numPendingTests":0,"numTodoTests":0,"perfStats":{"end":1682351898842,"runtime":229561,"slow":true,"start":1682351669281},"testFilePath":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/integration_tests/tests/e2e-tests.ts","failureMessage":null,"testResults":[{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":77299,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2022/10/30,undefined,100","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected No TransactionQty No TransactionPrice(no events) but has BillingQty Billing Price,2022/10/30,undefined,100"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":30723,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2022/11/30,10,10","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice equals TransactionQty and TransactionPrice,2022/11/30,10,10"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":30420,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2022/12/01,10,12","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice greater than TransactionQty and TransactionPrice,2022/12/01,10,12"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":30604,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2023/01/02,10,6","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView view should match with expected BillingQty BillingPrice lesser than TransactionQty and TransactionPrice,2023/01/02,10,6"},{"ancestorTitles":["\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n"],"duration":7445,"failureMessages":[],"fullName":"\n Upload pdf invoice to raw invoice bucket and generate transactions to verify that the BillingAndTransactionsCuratedView results matches with the expected data \n results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2023/02/28,1,undefined","status":"passed","title":"results retrieved from BillingAndTransactionsCuratedView should match with expected No BillingQty No Billing Price (no invoice) but has TransactionQty TransactionPrice,2023/02/28,1,undefined"}]}],"config":{"bail":0,"changedFilesWithAncestor":false,"ci":true,"collectCoverage":false,"collectCoverageFrom":[],"coverageDirectory":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/coverage","coverageProvider":"babel","coverageReporters":["json","text","lcov","clover"],"detectLeaks":false,"detectOpenHandles":false,"errorOnDeprecated":false,"expand":false,"findRelatedTests":false,"forceExit":false,"globalSetup":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/src/handlers/int-test-support/helpers/testSetup.ts","json":false,"lastCommit":false,"listTests":false,"logHeapUsage":false,"maxConcurrency":5,"maxWorkers":4,"noStackTrace":false,"nonFlagArgs":[],"notify":false,"notifyMode":"failure-change","onlyChanged":false,"onlyFailures":false,"passWithNoTests":false,"projects":[],"reporters":[["default",{}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-junit/index.js",{"outputDirectory":"reports","outputName":"testReport.xml"}],["/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/jest-html-reporters/index.js",{"publicPath":"./reports/jest-html-reports/test-report-2023-04-24T15:53:07.006Z","filename":"index.html","expand":true,"openReport":true,"pageTitle":"BTM INTEGRATION TEST REPORT"}]],"rootDir":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring","runTestsByPath":false,"seed":-46835530,"skipFilter":false,"snapshotFormat":{"escapeString":false,"printBasicPrototype":false},"testFailureExitCode":1,"testPathPattern":"","testSequencer":"/home/runner/work/di-billing-transaction-monitoring/di-billing-transaction-monitoring/node_modules/@jest/test-sequencer/build/index.js","testTimeout":1600000,"updateSnapshot":"none","useStderr":false,"verbose":true,"watch":false,"watchAll":false,"watchman":true},"endTime":1682351899610,"_reporterOptions":{"publicPath":"./reports/jest-html-reports/test-report-2023-04-24T15:53:07.006Z","filename":"index.html","expand":true,"pageTitle":"BTM INTEGRATION TEST REPORT","hideIcon":false,"testCommand":"","openReport":true,"failureMessageOnly":0,"enableMergeData":false,"dataMergeLevel":1,"inlineSource":false,"urlForTestFiles":"","darkTheme":false,"includeConsoleLog":false},"logInfoMapping":{},"attachInfos":{}})