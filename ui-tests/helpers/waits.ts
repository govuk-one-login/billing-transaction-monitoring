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
