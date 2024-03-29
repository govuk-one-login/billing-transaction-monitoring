export const getNumberFromMoneyText = (text: string): number => {
  // This'll be fine so long as we never receive a trillion pound invoice
  const numberText = /^£? ?((?:\d{1,12},?)+(?:\.\d+)?)(?: .*)?$/.exec(text);
  if (numberText === null) throw new Error(`Unsupported money format: ${text}`);
  return Number(numberText[1].replace(",", ""));
};

export const getNumberFromWholeQuantityText = (text: string): number => {
  const standardisedText = text.replace(/[.,]00?$/g, "").replace(/[.,]/g, "");
  return Number(standardisedText);
};
