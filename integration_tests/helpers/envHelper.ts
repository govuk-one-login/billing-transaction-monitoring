function resourcePrefix(): string {
  return `di-btm${
    process.env.ENV_NAME !== undefined ? "-" + process.env.ENV_NAME : ""
  }`;
}

export { resourcePrefix };
