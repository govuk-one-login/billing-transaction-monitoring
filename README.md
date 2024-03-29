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

Install checkov:

```sh
pip3 install checkov
```

Install husky hooks:

```sh
npm run husky:install
```

### Running the integration tests

To run the tests against aws environment

```sh
npm ci
npm run test:integration

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
npm run test:ephemeralEnvs
```
This will run all integration tests that do not require email functionality.

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

Our UI testing suite determines which environment to use based on the `ENV_NAME` environment variable. `ENV_NAME` is used to select the corresponding
base URL from the configuration in the `wdio.conf.ts` file.

If `ENV_NAME` is not set or if its set to a value other than "dev","build" or "staging", the baseURL defaults to the local URL which is http://localhost:3000 . This allows test to be run against local development environment by default.

The `ENV_NAME` variable is also used when uploading the extract test data file to S3 bucket. The test data file will be uploaded to the bucket corresponding to the specified environment ("dev","build" or "staging").

## Running All UI Tests

Run the following command to run all the UI tests

```sh
npm run test:ui
```

## Running a Single UI Test file
Open the `wdio.conf.ts` config file,Locate the specs section and modify it to include the path of the specific test file. For example: specs: ["./ui-tests/specs/home.spec.ts"].Then run following command to execute the specific test file:

```sh
npm run test:ui
```

## Running UI Tests in Different Browsers
Our UI testing suite supports running tests in Chrome, Firefox, Microsoft Edge and Safari. Below are the instructions for setting up and running tests in each of these browsers. If you are running Safari for first time, need to enable Remote Automation.After enabling Remote Automation can run tests.

To run tests in Chrome, Firefox , Microsoft Edge and Safari use the following command

```sh
export BROWSER=chrome && npm run test:ui # or firefox, MicrosoftEdge, safari 
```

## Lambda function code pattern

Some of our AWS Lambda function handlers are written with the `buildHandler` function from `src/handler-context`. For more info on this, see [`src/handler-context/README.md`](src/handler-context/README.md)

## Running manual workflows to build, deploy or test

A workflow has been created so that developers can build, deploy and test code in the cloud, with the help of GitHub Actions.     

To run this workflow, open the repository in GitHub, go to Actions, and select the `Deploy Local Eph Env and Run test` workflow. On the right-hand side of the screen, click the `Run workflow` button. Here you can select the branch on which you want to run the workflow and whether you need to build, to build and deploy, to run Integrations tests or to run UI Tests.

Note :  Please enter your name or purpose ( should be a short name or purpose  and  all in lower case )


The version of the workflow that will run will be the one found in the branch selected in the popup screen. 