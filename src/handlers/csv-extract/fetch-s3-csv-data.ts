import { Textract } from "aws-sdk";
import { fetchS3 } from "../../shared/utils";

export const fetchS3CsvData = async (
  bucket: string,
  key: string
): Promise<Textract.ExpenseDocument[]> => {
  const text = await fetchS3(bucket, key);

  let documents;
  try {
    documents = JSON.parse(text);
  } catch {
    throw new Error("Textract data not valid JSON.");
  }


  return documents;
};

