import { build, context } from "esbuild";

const isWatch = process.argv.includes("--watch");

const options = {
  entryPoints: ["src/extension.ts"],
  outfile: "out/extension.js",
  bundle: true,
  platform: "node",
  target: "node18",
  format: "cjs",
  sourcemap: true,
  sourcesContent: true,
  logLevel: "info",
  external: ["vscode", "vscode-html-languageservice", "vscode-css-languageservice"],
};

if (isWatch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log("[esbuild] watching...");
} else {
  await build(options);
}
