import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPublicPluginCandidate } from "../lib/public-plugin/builder.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "..");
const outputRoot = resolve(packageRoot, "generated", "submissions", "openai", "agdf");
const result = buildPublicPluginCandidate({ repoRoot, outputRoot });
console.log(JSON.stringify(result, null, 2));
