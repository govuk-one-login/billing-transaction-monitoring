# Billing & Transaction Monitoring

Monitors user identity verification events for billing purposes

## Prerequisites

- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - Used to build and deploy the application
- [NVM](https://github.com/nvm-sh/nvm) - to install and manage node versions
- [Docker](https://docs.docker.com/get-docker/) - Required to run SAM locally

If you are new to the Billing & Transaction Monitoring team, please also read [our New Starters guide](https://govukverify.atlassian.net/l/cp/XMirz7JE)

## Do this once

Install and use the correct node version (using .nvmrc):

```sh
nvm install
```

Install packages from lock file:

```sh
npm ci
```

Install husky hooks:

```sh
npm run husky:install
```

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
aws --endpoint-url=http://localhost:4566 sns publish --topic-arn arn:aws:sns:eu-west-2:000000000000:TestTxMATopic --message '{"event_id":"67e5-4b66-a403","timestamp":1668124800,"timestamp_formatted":"2022-11-11T09:26:18.000Z","event_name":"VENDOR_1_EVENT_1","component_id":"https://test.gov.uk","reIngestCount":0}'
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

```sh
npm ci
npm run test:integration

```

To run the tests against local environment

```sh
npm ci
npm run test:integration:local
```

To delete generated jest html reports locally. This will delete all the reports except last 3 reports
```sh
npm run test:cleanup:reports 
```

To run a single test file
```sh
JEST_ARGS="s3-vat-tests.ts" npm run test:integration
```
or

```sh
JEST_ARGS="--testPathPattern s3-vat-tests.ts" npm run test:integration
```
## Deploy

### To dev, build, staging, production

Open a PR against the `main` branch, get approvals for it and merge it. A GitHub action will pick up this merge and
do an automatic build/test cycle (unit-tests only) and on success kick off secure pipeline deployments into the
`di-btm-dev` environment in the `dev` account and to the `di-btm-build` environment in the `build` account.

Integration tests will then automatically run in the build account (eventually...) and, on success, an automatic
promotion to the `di-btm-staging` environment in the `staging` account will be triggered.

Further deployments into the `di-btm-integration` environment in the `integration` account and the `di-btm-production`
environment in the `production` account are triggered manually by approving the promotion in the AWS code-pipelines GUI
within the respective AWS accounts.

### Ephemeral environments

To deploy to your own private stack to the `dev` account:

Log in to the `dev` AWS account using your method of choice (`gds-cli`, AWS profiles, etc.).
Then run:

```sh
export ENV_NAME=yourname-purpose
```

Replace `yourname` with your name (short but recognisable) and replace `purpose` with a very short purpose of the env
like `testing`.

If you want to run your stack with a different (private) config stack, you should export the
`CONFIG_NAME` env-variable before deploying and running integration tests.

```sh
export CONFIG_NAME=your-config-stack-name
```

Your stack should then use a config-stack with the name `di-btm-cfg-${CONFIG_NAME}` instead of the default
config-stack `di-btm-cfg-dev`. This should only be necessary when developing config files and testing with
different configs, so you can leave this out for normal app development.

Then run:

```sh
npm run sam:build
npm run sam:deploy
```

To run integration tests against a private stack, make sure to set the env-variable `ENV_NAME` (and
`CONFIG_NAME` if necessary) accordingly and run:

```sh
npm run test:integration
```

### Alerts in ephemeral environments

By default, all alerts in ephemeral environments go into an SQS-queue called `di-btm-${ENV_NAME}-alarms-dummy`. If you
want them to go to the Slack channel `di-btm-errors-dev` instead, you can enable this by running:

```sh
export ENABLE_ALERTING=true
```

and running a deployment.

## Destroying your ephemeral environment

To destroy your private stack, make sure `ENV_NAME` is set as explained above and run:

```sh
npm run sam:teardown
```

The might be some manual interaction needed, the script will tell you what to do.

## Licence

[MIT License](LICENCE)

## PDF invoice data parsers

Depending on a PDF invoice's vendor, we can use a specific code module to parse data extracted from the PDF. Each
parser module has its own numeric version, which is saved in the standardised invoice data that the parser generates,
so that the parser can be re-run on specific data after the parser is updated. These versions are defined in
`cloudformation/standardised-invoice-storage.yaml`.

If you update a parser, please increment its version!

## Running UI Tests
Update the `baseURl` in the `wdio.conf.ts` config file. Set it to the desired base URL

Run the following command to run the UI tests

```sh
npm run test:ui
```

## Running a Single UI Test file
Open the `wdio.conf.ts` config file,Locate the specs section and modify it to include the path of the specific test file. For example: specs: ["./ui-tests/specs/home.spec.ts"].Then run following command to execute the specific test file:

```sh
npm run test:ui
```
