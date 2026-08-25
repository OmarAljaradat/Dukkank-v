import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  const banner = {
    js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
  };

  // 1. Build dist/index.mjs for standalone server running
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    external: ["*.node", "sharp", "pg-native"],
    sourcemap: "linked",
    plugins: [
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],
    banner,
  });

  // 2. Build standalone api/index.js for Vercel Serverless Function
  await esbuild({
    entryPoints: {
      index: path.resolve(artifactDir, "src/app.ts")
    },
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: path.resolve(artifactDir, "../../api"),
    outExtension: { ".js": ".js" },
    logLevel: "info",
    external: ["*.node", "sharp", "pg-native"],
    plugins: [
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],
    banner,
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
