import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcDir = path.resolve(root, "artifacts/dukkank/dist/public");

async function copyOutput() {
  const targets = [
    path.resolve(root, "dist"),
    path.resolve(root, "public"),
    path.resolve(root, "artifacts/api-server/dist"),
    path.resolve(root, "artifacts/api-server/public"),
  ];

  for (const target of targets) {
    try {
      await fs.mkdir(target, { recursive: true });
      await fs.cp(srcDir, target, { recursive: true });
    } catch (e) {
      console.warn(`Copy to ${target} warning:`, e.message);
    }
  }
}

copyOutput();
