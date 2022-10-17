# Billing & Transaction Monitoring

Monitors user identity verification events for billing purposes

## Prerequisites

- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - Used to build and deploy the application
- [Node.js](https://nodejs.org/en/) version 16 - Recommended way to install is via [NVM](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-docker/) - Required to run SAM locally

## Check before commit
```sh
npm run build-template
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
npm run build-template
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
aws --endpoint-url=http://localhost:4566 sns publish --topic-arn arn:aws:sns:eu-west-2:000000000000:TestTxMATopic --message '{"event_name":"EVENT_1", "event_id": "1234", "component_id": "TEST_COMP", "timestamp": 1342433}'
```

List the tables in DynamoDB
```sh
aws --endpoint-url=http://localhost:4566 dynamodb list-tables
```

Read from DynamoDB
```sh
aws --endpoint-url=http://localhost:4566 dynamodb scan --table-name di-btm-StorageTable-174d2ccf 
```

### Running the integration tests
````
npm i
npm run test:integration

````
## Licence

[MIT License](LICENCE)
