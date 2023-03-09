import { fetchS3 } from "../../shared/utils";

export const fetchS3CsvData = async (
  bucket: string,
  key: string
): Promise<object> => {
  const text = await fetchS3(bucket, key);

  let documents;
  try {
    documents = JSON.parse(text);
  } catch {
    throw new Error("Textract data not valid JSON.");
  }

  return documents;
};

