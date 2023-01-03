const resourcePrefix = (): string =>
  `di-btm${
    process.env.ENV_NAME !== undefined ? "-" + process.env.ENV_NAME : ""
  }`;

const configStackName = (): string =>
  `di-btm-cfg-${
    process.env.CONFIG_NAME !== undefined ? process.env.CONFIG_NAME : "dev"
  }`;

export { resourcePrefix, configStackName };
