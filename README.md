# Billing & Transaction Monitoring

Monitors user identity verification events for billing purposes

## Prerequisites

- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - Used to build and deploy the application
- [Node.js](https://nodejs.org/en/) version 16 - Recommended way to install is via [NVM](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-docker/) - Required to run SAM locally

## Run

```sh
sam build
sam local invoke CleanFunction --no-event  # TODO: add filtered transaction event (Jira: BTM-62)
sam local invoke StorageFunction --no-event  # TODO: add filtered & cleaned transaction event (Jira: BTM-63)
```

## Check before commit
```sh
checkov -f template.yaml --framework cloudformation --external-checks-git git@github.com:alphagov/di-devplatform-checkov-hook.git//src/gds_digitalidentity_checkovhook/custom_policies
```

## Licence

[MIT License](LICENCE)
