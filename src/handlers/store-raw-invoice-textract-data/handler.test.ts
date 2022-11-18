import { handler } from "./handler";

const OLD_ENV = process.env;
const oldConsoleError = console.error;
const oldConsoleLog = console.log;

beforeEach(() => {
  process.env = { ...OLD_ENV };
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  process.env = OLD_ENV;
  console.error = oldConsoleError;
  console.log = oldConsoleLog;
});

test("Store Raw Invoice Textract Data handler with RAW_INVOICE_TEXTRACT_DATA_STORAGE_HANDLER_THROW_ERROR set to true", async () => {
  process.env.RAW_INVOICE_TEXTRACT_DATA_STORAGE_HANDLER_THROW_ERROR = "true";

  let resultError;
  try {
    await handler();
  } catch (error) {
    resultError = error;
  }

  expect(resultError).toBeInstanceOf(Error);
});

test("Store Raw Invoice Textract Data handler with RAW_INVOICE_TEXTRACT_DATA_STORAGE_HANDLER_RETURN_VALUE", async () => {
  process.env.RAW_INVOICE_TEXTRACT_DATA_STORAGE_HANDLER_RETURN_VALUE =
    "given raw invoice Textract data storage handler return value environment variable";

  const result = await handler();

  expect(result).toBe(
    "given raw invoice Textract data storage handler return value environment variable"
  );
});
