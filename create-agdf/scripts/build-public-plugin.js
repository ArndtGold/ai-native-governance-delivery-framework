import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPublicPluginCandidate } from "../lib/public-plugin/builder.js";
import { createPortableSchemaValidator } from "./support/portable-schema.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "..");
const outputRoot = resolve(packageRoot, "generated", "submissions", "openai", "agdf");
const result = buildPublicPluginCandidate({ repoRoot, outputRoot, validateSchema: createPortableSchemaValidator(repoRoot) });
console.log(JSON.stringify(result, null, 2));
