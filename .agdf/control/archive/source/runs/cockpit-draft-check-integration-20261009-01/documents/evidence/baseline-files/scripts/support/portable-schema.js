import { getPluginSourceRoot } from "../public-plugin/source-root.js";
import Ajv2020 from "ajv/dist/2020.js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const pinned = {
  plugin: "0a4aad95ce337878ad38802ebf0daa3fde76abe3f65400c86bcbb1ec0b3ab883",
  mcp: "6539175bfcdf43085855183e86da40ea94b166547a72b47ae9a0a390516d3acb",
};

// This entry point is build/test-only. No Ajv import enters the offline runtime.
export function createPortableSchemaValidator(repoRoot) {
  const ajv = new Ajv2020({ strict: true, allErrors: true, coerceTypes: false, useDefaults: false, removeAdditional: false });
  const validators = {};
  for (const [name, digest] of Object.entries(pinned)) {
    const bytes = readFileSync(join(getPluginSourceRoot(repoRoot), "meta", "schemas", "agent-plugins", "1.0.0", `${name}.schema.json`));
    if (createHash("sha256").update(bytes).digest("hex") !== digest) throw new Error(`AGDF_PORTABLE_SCHEMA_INPUT_MISMATCH: ${name}`);
    const schema = JSON.parse(bytes);
    if (schema.$id !== `https://agent-plugins.org/schemas/1.0.0/${name}.schema.json`) throw new Error(`AGDF_PORTABLE_SCHEMA_INPUT_MISMATCH: ${name} ID`);
    validators[name] = ajv.compile(schema); // Only local, hash-bound refs; no loadSchema callback.
  }
  return (kind, value) => {
    const validate = validators[kind];
    if (!validate || !validate(value)) throw new Error(`AGDF_PORTABLE_SCHEMA_INVALID: ${kind}: ${ajv.errorsText(validate?.errors)}`);
  };
}
