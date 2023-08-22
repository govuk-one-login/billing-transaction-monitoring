import { kms } from "../clients";
import { TextEncoder } from "node:util";

export const decryptKms = async (
  encryptedBytes: Uint8Array,
  context?: Record<string, string>
): Promise<Uint8Array> => {
  const request = {
    CiphertextBlob: encryptedBytes,
    EncryptionContext: context,
  };

  const { Plaintext: result } = await kms.decrypt(request);

  if (!result) throw Error("Failed decryption");

  if (typeof result === "string") {
    const textEncoder = new TextEncoder();
    return textEncoder.encode(result);
  }

  if (result instanceof Uint8Array) return result;

  return result;
};
