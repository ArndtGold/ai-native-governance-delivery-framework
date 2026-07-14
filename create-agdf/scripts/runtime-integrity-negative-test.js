import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-runtime-integrity-"));
const integrityScript = join(fixtureRoot, "plugin", "scripts", "check-runtime-integrity.mjs");
const templatePath = join(fixtureRoot, "plugin", "control", "templates", "artefacts", "VERIFIED_CHANGE.md");

function makeFixture() {
  cpSync(join(repoRoot, "plugin"), join(fixtureRoot, "plugin"), { recursive: true });
  for (const entry of [".claude-plugin", "agdf", "create-agdf", "pages", ".agdf", "LICENSE"]) {
    symlinkSync(join(repoRoot, entry), join(fixtureRoot, entry));
  }
}

function expectIntegrityFailure(expected) {
  const result = spawnSync(process.execPath, [integrityScript], {
    encoding: "utf8",
    env: { ...process.env, AGDF_RUNTIME_INTEGRITY_ROOT: fixtureRoot },
  });
  assert.notEqual(result.status, 0, "runtime integrity must reject a broken Verified Change surface");
  assert.match(`${result.stdout}\n${result.stderr}`, expected);
}

try {
  makeFixture();
  unlinkSync(templatePath);
  expectIntegrityFailure(/plugin\/control\/templates\/artefacts\/VERIFIED_CHANGE\.md missing/);

  rmSync(join(fixtureRoot, "plugin"), { recursive: true, force: true });
  cpSync(join(repoRoot, "plugin"), join(fixtureRoot, "plugin"), { recursive: true });
  const template = readFileSync(templatePath, "utf8").replace("canonical_owner", "canonical_owner_removed");
  writeFileSync(templatePath, template, "utf8");
  expectIntegrityFailure(/VERIFIED_CHANGE\.md missing control field: canonical_owner/);

  console.log("Runtime integrity negative tests passed");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
