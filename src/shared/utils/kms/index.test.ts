import { Blob } from "node:buffer";
import { TextEncoder } from "node:util";
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

    mockedKms.decrypt.mockReturnValue({ promise: mockedDecryptPromise } as any);

    givenEncryptedBytes = "given encrypted bytes" as any;
    givenContext = "given context" as any;
  });

  test("KMS decrypter with undefined decryption result", async () => {
    const resultPromise = decryptKms(givenEncryptedBytes, givenContext);

    await expect(resultPromise).rejects.toThrow("Failed decryption");
    expect(mockedKms.decrypt).toHaveBeenCalledTimes(1);
    expect(mockedKms.decrypt).toHaveBeenCalledWith({
      CiphertextBlob: givenEncryptedBytes,
      EncryptionContext: givenContext,
    });
    expect(mockedDecryptPromise).toHaveBeenCalledTimes(1);
  });

  test("KMS decrypter with string decryption result", async () => {
    mockedDecryptResult = "mocked decryption result";

    const result = await decryptKms(givenEncryptedBytes, givenContext);

    const textEncoder = new TextEncoder();
    const expectedResult = textEncoder.encode(mockedDecryptResult);
    expect(result).toEqual(expectedResult);
    expect(mockedKms.decrypt).toHaveBeenCalledTimes(1);
    expect(mockedKms.decrypt).toHaveBeenCalledWith({
      CiphertextBlob: givenEncryptedBytes,
      EncryptionContext: givenContext,
    });
    expect(mockedDecryptPromise).toHaveBeenCalledTimes(1);
  });

  test("KMS decrypter with byte array decryption result", async () => {
    mockedDecryptResult = new Uint8Array([12, 34, 56]);

    const result = await decryptKms(givenEncryptedBytes, givenContext);

    expect(result).toEqual(mockedDecryptResult);
    expect(mockedKms.decrypt).toHaveBeenCalledTimes(1);
    expect(mockedKms.decrypt).toHaveBeenCalledWith({
      CiphertextBlob: givenEncryptedBytes,
      EncryptionContext: givenContext,
    });
    expect(mockedDecryptPromise).toHaveBeenCalledTimes(1);
  });

  test("KMS decrypter with Blob decryption result", async () => {
    mockedDecryptResult = new Blob(["mocked decryption result"]);

    const result = await decryptKms(givenEncryptedBytes, givenContext);

    const expectedDecryptResultArrayBuffer =
      await mockedDecryptResult.arrayBuffer();
    const expectedResult = new Uint8Array(expectedDecryptResultArrayBuffer);
    expect(result).toEqual(expectedResult);
    expect(mockedKms.decrypt).toHaveBeenCalledTimes(1);
    expect(mockedKms.decrypt).toHaveBeenCalledWith({
      CiphertextBlob: givenEncryptedBytes,
      EncryptionContext: givenContext,
    });
    expect(mockedDecryptPromise).toHaveBeenCalledTimes(1);
  });

  test("KMS decrypter with generic object decryption result", async () => {
    mockedDecryptResult = { foo: "bar" };

    const resultPromise = decryptKms(givenEncryptedBytes, givenContext);

    await expect(resultPromise).rejects.toThrow(
      "Invalid decryption result type"
    );
    expect(mockedKms.decrypt).toHaveBeenCalledTimes(1);
    expect(mockedKms.decrypt).toHaveBeenCalledWith({
      CiphertextBlob: givenEncryptedBytes,
      EncryptionContext: givenContext,
    });
    expect(mockedDecryptPromise).toHaveBeenCalledTimes(1);
  });
});
