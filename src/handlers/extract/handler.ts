export const handler = async (): Promise<string | undefined> => {
  if (
    String(process.env.EXTRACTION_HANDLER_THROW_ERROR).toLowerCase() === "true"
  ) {
    const message =
      "Environment variable EXTRACTION_HANDLER_THROW_ERROR is true";
    console.error(message);
    throw new Error(message);
  }

  return process.env.EXTRACTION_HANDLER_RETURN_VALUE;
};
