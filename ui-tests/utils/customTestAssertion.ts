type Capabilities = {
  browserName: string;
};

export const expectEqual = (actual: string, expected: string): void => {
  /* Applying trim and case-insensitive comparison for Safari the UI shows eg text as "PENDING" but when retrieving the element
    text it returned as  " Pending" */
  const browserName = (browser.capabilities as Capabilities).browserName;
  if (browserName === "Safari") {
    expect(actual.trim().toUpperCase()).toEqual(expected.toUpperCase());
  } else {
    expect(actual).toEqual(expected);
  }
};
