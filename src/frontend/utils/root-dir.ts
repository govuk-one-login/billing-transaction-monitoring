import path from "path";
import { fileURLToPath } from "url";

let dirname: string;
try {
  // this is available once code is webpacked
  dirname = __dirname;
} catch {
  // this is a useful fallback for running locally
  const filePath = fileURLToPath(import.meta.url);
  dirname = path.dirname(filePath);
}

export const rootDir =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
    ? /(^[/\-_A-Z0-9]{0,128}\/frontend)[/\-_A-Z0-9]{0,128}$/i.exec(dirname)?.[1]
    : dirname;
