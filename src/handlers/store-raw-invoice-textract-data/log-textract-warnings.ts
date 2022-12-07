import { Textract } from "aws-sdk";

export const logTextractWarnings = (warnings: Textract.Warnings): void => {
  for (const { ErrorCode: code, Pages: pageNumbers } of warnings) {
    let message = "Warning";

    if (code !== undefined) message = `${message} code ${code}`;

    if (pageNumbers !== undefined) {
      const pagesText = pageNumbers.map(String).join(", ");
      message = `${message} for pages ${pagesText}`;
    }

    console.warn(message);
  }
};
