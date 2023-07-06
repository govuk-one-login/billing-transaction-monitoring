export const waitForPageLoad = async (
  url: string,
  timeout: number = 5000
): Promise<void> => {
  await browser.waitUntil(
    async () => {
      return (await browser.getUrl()) === url;
    },
    {
      timeout,
      timeoutMsg: `Page did not navigate to ${url}`,
    }
  );
};
