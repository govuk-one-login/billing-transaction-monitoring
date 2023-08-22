import { kms } from "./client";
import { decryptKms } from "./index";

jest.mock("./client");
const mockedKms = kms as jest.Mocked<typeof kms>;

describe("KMS decrypter", () => {
  let mockedDecryptPromise: jest.Mock;
  let mockedDecryptResult: any;
  let givenEncryptedBytes: Uint8Array;
  let givenContext: {};

  beforeEach(() => {
    jest.resetAllMocks();

    mockedDecryptPromise = jest.fn(async () => ({
      Plaintext: mockedDecryptResult,
    }));

    mockedKms.decrypt.mockImplementation(mockedDecryptPromise);
  });

  test("KMS decrypter with undefined decryption result", async () => {
    mockedDecryptResult = undefined;
    givenEncryptedBytes = new Uint8Array([12, 34, 56]);
    givenContext = {};

    const resultPromise = decryptKms(givenEncryptedBytes, givenContext);

    await expect(resultPromise).rejects.toThrow("Failed decryption");
    expect(mockedKms.decrypt).toHaveBeenCalledTimes(1);
    expect(mockedKms.decrypt).toHaveBeenCalledWith({
      CiphertextBlob: givenEncryptedBytes,
      EncryptionContext: givenContext,
    });
    expect(mockedDecryptPromise).toHaveBeenCalledTimes(1);
  });

  test("KMS decrypter with byte array decryption result", async () => {
    mockedDecryptResult = new Uint8Array([12, 34, 56]);
    givenEncryptedBytes = new Uint8Array([24, 48, 72]);
    givenContext = {};

    const result = await decryptKms(givenEncryptedBytes, givenContext);

    expect(result).toEqual(mockedDecryptResult);
    expect(mockedKms.decrypt).toHaveBeenCalledTimes(1);
    expect(mockedKms.decrypt).toHaveBeenCalledWith({
      CiphertextBlob: givenEncryptedBytes,
      EncryptionContext: givenContext,
    });
    expect(mockedDecryptPromise).toHaveBeenCalledTimes(1);
  });
});
