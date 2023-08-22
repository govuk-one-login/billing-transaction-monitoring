import { logger } from "../../shared/utils";
import { Warning } from "@aws-sdk/client-textract";

export const logTextractWarnings = (warnings: Warning[]): void => {
  for (const { ErrorCode: code, Pages: pageNumbers } of warnings) {
    let message = "Warning";

    if (code !== undefined) message = `${message} code ${code}`;

    if (pageNumbers !== undefined) {
      const pagesText = pageNumbers.map(String).join(", ");
      message = `${message} for pages ${pagesText}`;
    }

    logger.warn(message);
  }
};
