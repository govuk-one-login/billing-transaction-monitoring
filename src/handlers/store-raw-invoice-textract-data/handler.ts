export const handler = async (): Promise<string | undefined> => {
  if (
    String(
      process.env.RAW_INVOICE_TEXTRACT_DATA_STORAGE_HANDLER_THROW_ERROR
    ).toLowerCase() === "true"
  ) {
    const message =
      "Environment variable RAW_INVOICE_TEXTRACT_DATA_STORAGE_HANDLER_THROW_ERROR is true";
    console.error(message);
    throw new Error(message);
  }

  return process.env.RAW_INVOICE_TEXTRACT_DATA_STORAGE_HANDLER_RETURN_VALUE;
};
