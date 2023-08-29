#!/bin/bash

# This script will only run in AWS Codepipeline. It has access to the following environment variables:
# CFN_<OUTPUT-NAME> - Stack output value (replace <OUTPUT-NAME> with the name of the output)
# TEST_REPORT_ABSOLUTE_DIR - Absolute path to where the test report file should be placed
# TEST_REPORT_DIR - Relative path from current directory to where the test report file should be placed
# TEST_ENVIRONMENT - The environment the pipeline is running the tests in

# This file needs to be located at the root when running in the container. The path /test-app is defined
# in the Dockerfile.
cd /test-app || exit 1

export ENV_NAME=$(echo $SAM_STACK_NAME | cut -d - -f 3-)
export CONFIG_NAME=${ENV_NAME}

npm run test:integration

INTEGRATION_TESTS_EXIT_CODE=$?

cp reports/testReport.xml $TEST_REPORT_ABSOLUTE_DIR/junit.xml

npm run test:ui

UI_TESTS_EXIT_CODE=$?

cp reports/ui-test-report*.json $TEST_REPORT_ABSOLUTE_DIR

if [ $INTEGRATION_TESTS_EXIT_CODE -ne 0 ] || [ $UI_TESTS_EXIT_CODE -ne 0 ] ; then
  exit 1
fi
