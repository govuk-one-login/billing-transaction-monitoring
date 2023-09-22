export const waitForPageLoad = async (): Promise<void> => {
  const maxWaitTime = 10000; // 10 seconds
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitTime) {
    const isPageLoaded = await browser.execute(
      () => document.readyState === "complete"
    );

    if (isPageLoaded) {
      return;
    }

    await browser.pause(500);
  }

  throw new Error("Page did not load within the specified time.");
};

export const waitForElementDisplayed = async (
  element: WebdriverIO.Element,
  { name = "Element", timeout = 5000 } = {}
): Promise<void> => {
  await browser.waitUntil(
    async () => {
      return await element.isDisplayed();
    },
    {
      timeout,
      timeoutMsg: `${name} was not displayed within ${timeout}ms`,
    }
  );
};
