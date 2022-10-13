function waitForTrue(predicate: Function, delayMS: number, timeoutMS: number) {
  let intervalHandle: any;
  return new Promise((resultGenerated) => {
    const complete = (result: boolean) => {
      clearInterval(intervalHandle);
      resultGenerated(result);
    };
    intervalHandle = setInterval(
      async () => (await predicate()) && complete(true),
      delayMS
    );
    setTimeout(() => complete(false), timeoutMS);
  });
}

export { waitForTrue };
