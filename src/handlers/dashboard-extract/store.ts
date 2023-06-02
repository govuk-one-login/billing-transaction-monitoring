import { putTextS3 } from "../../shared/utils";

export const store = async (bucket: string, message: string): Promise<void> => {
  await putTextS3(bucket, "btm_extract_data/full-extract.json", message);
};
