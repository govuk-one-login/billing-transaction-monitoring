import { kms } from "./client";

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

  return result;
};
