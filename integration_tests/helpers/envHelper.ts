function resourcePrefix() {
  return `di-btm${process.env.ENV_NAME ? '-' + process.env.ENV_NAME : ''}`;
}

export { resourcePrefix };
