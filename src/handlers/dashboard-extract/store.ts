import { putTextS3 } from "../../shared/utils";
import { DASHBOARD_EXTRACT_PATH } from "../../shared/constants";

export const store = async (bucket: string, message: string): Promise<void> => {
  await putTextS3(bucket, DASHBOARD_EXTRACT_PATH, message);
};
