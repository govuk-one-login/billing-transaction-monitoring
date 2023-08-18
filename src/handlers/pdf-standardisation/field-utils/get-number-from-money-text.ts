export const getNumberFromMoneyText = (text: string): number => {
  // This'll be fine so long as we never receive a trillion pound invoice
  const numberText = text.match(/^£? ?((?:\d{0,12},?)+\.\d\d+)(?: .*)?$/);
  if (numberText === null) throw new Error(`Unsupported money format: ${text}`);
  return Number(numberText[1].replace(",", ""));
};
