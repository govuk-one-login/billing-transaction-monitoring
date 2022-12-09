async function waitForTrue(
  predicate: Function,
  delayMS: number,
  timeoutMS: number
): Promise<boolean> {
  let intervalHandle: any;
  return await new Promise((resolve) => {
    const complete = (result: boolean): void => {
      clearInterval(intervalHandle);
      resolve(result);
    };
    const callPredicateAndComplete = async (): Promise<void> => {
      await predicate();
      complete(true);
    };
    intervalHandle = setInterval(() => {
      void callPredicateAndComplete();
    }, delayMS);
    setTimeout(() => complete(false), timeoutMS);
  });
}

export { waitForTrue };
