import { kms } from "../clients";
import { Blob } from "node:buffer";
import { TextEncoder } from "node:util";

export const decryptKms = async (
  encryptedBytes: Uint8Array,
  context: AWS.KMS.EncryptionContextType
): Promise<Uint8Array> => {
  const request = {
    CiphertextBlob: encryptedBytes,
    EncryptionContext: context,
  };

  const { Plaintext: result } = await kms.decrypt(request).promise();

  if (!result) throw Error("Failed decryption");

  if (typeof result === "string") {
    const textEncoder = new TextEncoder();
    return textEncoder.encode(result);
  }

  if (result instanceof Uint8Array) return result;

  if (!(result instanceof Blob)) throw Error("Invalid decryption result type");

  const resultArrayBuffer = await result.arrayBuffer();
  return new Uint8Array(resultArrayBuffer);
};
