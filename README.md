# Billing & Transaction Monitoring

Monitors user identity verification events for billing purposes

## Prerequisites

- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - Used to build and deploy the application
- [Node.js](https://nodejs.org/en/) version 16 - Recommended way to install is via [NVM](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-docker/) - Required to run SAM locally

If you are new to the Billing & Transaction Monitoring team, please also read [our New Starters guide](https://govukverify.atlassian.net/l/cp/XMirz7JE)

## Check before commit
```sh
npm run build:template
checkov -f template.yaml --framework cloudformation --external-checks-git git@github.com:alphagov/di-devplatform-checkov-hook.git//src/gds_digitalidentity_checkovhook/custom_policies
```
N.B. You may get Python errors due to conflicting dependencies with SAM CLI. If you do, run this and try again:
```sh
pip3 install checkov
```

## LocalStack
The entire stack can be brought up locally using localstack.

### Requirements
- Python
- Docker

### To install
```sh
python3 -m pip install localstack
pip3 install aws-sam-cli-local
```

### Start localstack
N.B. You may need to run
```sh
gds aws di-btm-dev -s 
```
before this to gain the correct privileges and will need to be on the VPN.

```sh
docker run --rm -it -p 4566:4566 -p 4571:4571 -e LOCALSTACK_DEBUG=1 localstack/localstack
```

### Bringing up the stack
```sh
npm run build
npm run build:template NO_LOCAL
samlocal build
samlocal deploy --resolve-s3 --config-env local
```
N.B. You may get Python errors due to conflicting dependencies with Checkov. If you do, run this and try again:
```sh
pip3 install aws-sam-cli
```

### Interrogating the stack
Any of the aws commands can now be used by adding the --endpoint-url parameter e.g.

List all topics
```sh
aws --endpoint-url=http://localhost:4566 sns list-topics
```

Publish a message on the SNS topic
```sh
aws --endpoint-url=http://localhost:4566 sns publish --topic-arn arn:aws:sns:eu-west-2:000000000000:TestTxMATopic --message '{"event_name":"EVENT_1", "event_id": "1234", "component_id": "TEST_COMP", "timestamp": 1666006241000}'
```

List the buckets in S3
```sh
aws --endpoint-url=http://localhost:4566 s3api list-buckets
```

Read from s3
```sh
aws --endpoint-url=http://localhost:4566 s3api list-objects --bucket di-btm-storagebucket-fc161d3a 
```

### Running the integration tests
To run the tests against aws environment
````
npm i
npm run test:integration

````

To run the tests against local environment
````
npm i
npm run test:integration:local
````

To generate  emailable allure report after running the integration test
````
 docker run --name allure -p 5050:5050  \
                 -v ${PWD}/allure-results:/app/allure-results \
                 -v ${PWD}/allure-reports:/app/default-reports \
                 frankescobar/allure-docker-service
````

To clean the allure results and allure reports folder 
````
npm run beforeIntTest
````

## Deploy

To deploy to the `dev` environment on the main stack `di-btm`, commit to the `main` branch, this will also deploy into
the `build` environment in the build account.

To deploy to your own on-demand stack:

Log in to the `dev` account using your method of choice (`gds-cli`, AWS profiles, etc.).
Then run:

```
export ENV_NAME=dev-od-ph-purpose
```
Replace `ph` with your initials and replace `purpose` with a very short purpose of the env like `testing`.

Then run:
```
npm run sam:build
npm run sam:deploy
```

`npm run test:integration` should automatically run against your own env as long as the env-variable `ENV_NAME` is properly set and exported.

To run the texract function integration test

The test invoice file needs to be manually uploaded into test S3 bucket (ENV_NAME-test-invoice-pdf) with name Invoice.pdf

After deploying to an environment for the first time, if you want to receive alerts about errors, manually create a CloudFormation stack in the Amazon Web Services console with `alert-chatbot-template.yaml` and the parameters for the Slack workspace and channel IDs (eleven- and nine-character codes found in the URL for the Slack channel) as well as the Amazon Resource Name for Simple Notification Service output by the `di-btm` stack

## Destroying your on-demand stack

To destroy your stack, make sure `ENV_NAME` is set as explained above and run:

```
npm run sam:teardown
```

The might be some manual interaction needed, the script will tell you what to do.

## Licence

[MIT License](LICENCE)
