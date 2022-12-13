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

function removeTrailingZerosAfterDeciRegExp(str: string) {
  return str.replace(/(\d+)(?:(\.\d*?[1-9]+)0*|\.0*)/g, '"$1$2"'); // removes trailing zeros after decimal point eg 1200.00 to 1200
}

export { waitForTrue, removeTrailingZerosAfterDeciRegExp };
