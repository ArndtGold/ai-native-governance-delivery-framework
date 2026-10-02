import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { resolveConfiguredArtifactLanguage } from "#agdf-core/resources/context.js";

// The approval summary source language comes from config.json artifact_language, never from guessing the
// artefact text: a German UR keeps the English template headings and must still render for German review.
const temporary = mkdtempSync(join(tmpdir(), "agdf-artifact-language-"));
const sourceCli = resolve(import.meta.dirname, "../bin/create-agdf.js");
try {
  const configDir = join(temporary, "defaults", ".agdf", "control");
  mkdirSync(configDir, { recursive: true });
  assert.equal(resolveConfiguredArtifactLanguage(join(temporary, "defaults")), "en", "missing config defaults to English");
  writeFileSync(join(configDir, "config.json"), "{ broken");
  assert.equal(resolveConfiguredArtifactLanguage(join(temporary, "defaults")), "en", "invalid JSON defaults to English");
  writeFileSync(join(configDir, "config.json"), JSON.stringify({ artifact_language: "not a tag!" }));
  assert.equal(resolveConfiguredArtifactLanguage(join(temporary, "defaults")), "en", "invalid tag defaults to English");
  writeFileSync(join(configDir, "config.json"), JSON.stringify({ artifact_language: "de-DE" }));
  assert.equal(resolveConfiguredArtifactLanguage(join(temporary, "defaults")), "de", "region subtags reduce to the language");

  const generated = resolve(import.meta.dirname, "../generated");
  for (const entry of ["plugins/agdf", ".agents/plugins/marketplace.json"]) cpSync(join(generated, entry), join(temporary, entry), { recursive: true });
  const plugin = join(temporary, "plugins", "agdf");
  const validator = join(plugin, "runtime", "agdf-local.js");
  const env = { ...process.env, AGDF_SURFACE: "codex", PLUGIN_ROOT: plugin };
  delete env.AGDF_RUN_ID;
  const call = (...args) => {
    const r = spawnSync(process.execPath, [validator, ...args], { encoding: "utf8", env });
    assert.equal(r.error, undefined);
    return JSON.parse(r.stdout);
  };
  const germanUr = (root) => readFileSync(join(root, ".agdf/control/templates/artefacts/UR.md"), "utf8")
    .replace("# UR: <Title>", "# UR: subtract ergänzen")
    .replace(/(## 1\. Problem\n\n)[^\n]+/u, "$1Die Bibliothek bietet nur add und keine Subtraktion.")
    .replace(/(## 2\. Goal\n\n)[^\n]+/u, "$1Die Bibliothek exportiert zusätzlich subtract mit einem Test.")
    .replace(/(## 3\. Scope\n\n)[^\n]+/u, "$1Eine neue Funktion und ein Test, sonst keine Änderungen.");

  const prepare = (name, language) => {
    const root = join(temporary, name);
    mkdirSync(root);
    execFileSync("git", ["init", "-q", root]);
    execFileSync(process.execPath, [sourceCli, "init", "--dir", root, "--language", language], { stdio: "pipe" });
    const created = { revision_id: spawnSync(process.execPath, [validator, "run-create", "--dir", root, "--run", "subtract"], { encoding: "utf8", env }).stdout.match(/revision_id: (\S+)/u)[1] };
    mkdirSync(join(root, ".agdf/control/artefacts/subtract"), { recursive: true });
    writeFileSync(join(root, ".agdf/control/artefacts/subtract/UR.md"), germanUr(root));
    const step = call("run-step", "--dir", root, "--run", "subtract", "--revision", created.revision_id, "--step", "ur", "--title", "subtract ergänzen");
    assert.equal(step.outcome, "recorded", JSON.stringify(step));
    const dispatch = call("skill-dispatch", "--json", "--skill", "gate-check", "--surface", "codex", "--language", "de",
      "--working-directory", root, "--target-source", "explicit_target", "--primary-target", root,
      "--intake", "--intake-mode", "resume", "--run", "subtract", "--revision", step.revision_id);
    return { root, revision: step.revision_id, dispatch };
  };

  const german = prepare("german", "de");
  assert.equal(german.dispatch.outcome, "intake_continuation", JSON.stringify(german.dispatch));
  assert.equal(german.dispatch.continuation.phase, "presentation_required");
  const presented = call("run-present", "--dir", german.root, "--run", "subtract", "--gate", "UR", "--revision", german.revision, "--language", "de");
  assert.equal(presented.outcome, "prepared", JSON.stringify(presented));
  assert.match(presented.text, /- Problem: Die Bibliothek bietet nur add und keine Subtraktion\./u);
  assert.doesNotMatch(presented.text, /AGDF Approval Summary/u, "same source and presentation language needs no translated block");

  // English artefacts presented in German need the localized block; the dispatcher keeps that concrete recovery.
  const english = prepare("english", "en");
  assert.equal(english.dispatch.outcome, "evaluator_error");
  assert.match(english.dispatch.recovery.action, /AGDF Approval Summary \(de; source=en\)/u, english.dispatch.recovery.action);
  assert.match(english.dispatch.recovery.action, /UR\.md/u);
  console.log("artifact language tests passed (config source, English defaults, dispatcher recovery)");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
