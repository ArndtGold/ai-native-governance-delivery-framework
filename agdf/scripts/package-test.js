import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const cache = mkdtempSync(join(tmpdir(), "agdf-cli-pack-"));
let output;
try {
  output = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, npm_config_cache: cache },
  }));
} finally {
  rmSync(cache, { recursive: true, force: true });
}
const report = Array.isArray(output) ? output[0] : output["@agdf/cli"];
assert.ok(Array.isArray(report?.files));
const paths = report.files.map(({ path }) => path);
for (const required of ["LICENSE", "NOTICE", "README.md", "bin/agdf.js", "package.json"]) {
  assert.equal(paths.filter((path) => path === required).length, 1, `@agdf/cli tarball must contain ${required} exactly once`);
}
assert.equal(new Set(paths).size, paths.length);
console.log(`AGDF CLI package contents passed (${paths.length} files).`);
