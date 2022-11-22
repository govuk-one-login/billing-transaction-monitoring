import { VALID_TEXTRACT_STATUS_MESSAGES } from "../../shared/constants";
import { ValidTextractStatusMessage } from "../../shared/types";

export const isValidTextractStatus = (
  status?: string
): status is ValidTextractStatusMessage =>
  VALID_TEXTRACT_STATUS_MESSAGES.has(status as ValidTextractStatusMessage);
