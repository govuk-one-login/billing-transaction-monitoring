ARG ALPINE_VERSION=3.16

FROM python:alpine${ALPINE_VERSION} AS builder

ARG AWS_CLI_VERSION=2.8.13

RUN apk update
RUN apk add --no-cache \
      build-base \
      cmake \
      git \
      groff \
      libffi-dev \
      chromium \
      chromium-chromedriver

ENV PATH="/usr/bin:${PATH}"

RUN git clone --single-branch --depth 1 -b ${AWS_CLI_VERSION} https://github.com/aws/aws-cli.git

WORKDIR /aws-cli

RUN sed -i 's/PyInstaller.*/PyInstaller==5.6.2/g' requirements-build.txt
RUN python -m venv venv
RUN . venv/bin/activate
RUN scripts/installers/make-exe
RUN unzip -q dist/awscli-exe.zip
RUN aws/install --bin-dir /aws-cli-bin
RUN /aws-cli-bin/aws --version
RUN rm -rf /usr/local/aws-cli/v2/current/dist/aws_completer /usr/local/aws-cli/v2/current/dist/awscli/data/ac.index /usr/local/aws-cli/v2/current/dist/awscli/examples
RUN find /usr/local/aws-cli/v2/current/dist/awscli/botocore/data -name examples-1.json -delete

FROM node:16-alpine${ALPINE_VERSION} AS run-tests

COPY --from=builder /usr/local/bin/python /usr/local/bin/python
COPY --from=builder /usr/local/lib/ /usr/local/lib/
COPY --from=builder /usr/local/aws-cli/ /usr/local/aws-cli/
COPY --from=builder /aws-cli-bin/ /usr/local/bin/

RUN apk update && \
      apk upgrade && \
      apk add --no-cache \
      bash \
      python3 chromium chromium-chromedriver

RUN python3 -m ensurepip --upgrade
RUN pip3 install --no-cache --upgrade pip setuptools

WORKDIR /test-app

COPY package.json package-lock.json tsconfig.json jest.integration.config.ts wdio.conf.ts ./
COPY integration_tests ./integration_tests
COPY src/handlers/int-test-support/ ./src/handlers/int-test-support/
COPY ui-tests ./ui-tests
COPY src/shared/ ./src/shared/

RUN npm ci --ignore-scripts

RUN cp /usr/bin/chromedriver /test-app/node_modules/chromedriver/bin/chromedriver

WORKDIR /test-app/integration_tests

RUN mv ./run-tests.sh /run-tests.sh

## To run unit-tests for starters
#WORKDIR /test-app
#COPY jest.config.cjs ./
#COPY test-helpers ./test-helpers
#COPY src ./src

RUN addgroup -S btm_user_group
RUN adduser -S btm_user -G btm_user_group
RUN chown -R btm_user: /run-tests.sh
RUN chmod -R u+x /run-tests.sh
RUN chown -R btm_user: /test-app
RUN chmod -R u+rwx /test-app
USER btm_user

ENV TEST_VIA_LAMBDA=true

ENTRYPOINT ["/run-tests.sh"]
