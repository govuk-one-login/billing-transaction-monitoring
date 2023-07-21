import path from "path";
import { fileURLToPath } from "url";

let dirname: string;
try {
  dirname = __dirname;
} catch {
  const filePath = fileURLToPath(import.meta.url);
  dirname = path.dirname(filePath);
}

export const [, rootDir] =
  dirname.match(/(^[/\-_A-Z0-9]{0,128}\/frontend)[/\-_A-Z0-9]{0,128}$/i) ?? [];
