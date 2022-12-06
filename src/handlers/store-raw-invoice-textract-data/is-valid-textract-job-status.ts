import { VALID_TEXTRACT_STATUS_MESSAGES } from "../../shared/constants";
import { ValidTextractJobStatus } from "../../shared/types";

export const isValidTextractJobStatus = (
  status?: string
): status is ValidTextractJobStatus =>
  VALID_TEXTRACT_STATUS_MESSAGES.has(status as ValidTextractJobStatus);
