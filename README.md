# Billing & Transaction Monitoring

Monitors user identity verification events for billing purposes

## Prerequisites

- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - Used to build and deploy the application
- [Node.js](https://nodejs.org/en/) version 16 - Recommended way to install is via [NVM](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-docker/) - Required to run SAM locally
- [Checkov](https://www.checkov.io/) - Scans cloud infrastructure configurations to find misconfigurations before they're deployed. Added as a Husky pre-commit hook.

## Run

```sh
sam build
sam local invoke HelloWorldFunction --no-event  # Replace this when there is something useful to run
```
