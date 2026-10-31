import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { resolveConfiguredArtifactLanguage, resolveArtifactPresentationLanguages } from "#agdf-core/resources/context.js";
import { renderReviewableApproval } from "#agdf-core/control-state/run-presentation-render.js";

// The approval summary source language comes from config.json artifact_language, never from guessing the
// artefact text: a German UR keeps the English template headings and must still render for German review.
const temporary = mkdtempSync(join(tmpdir(), "agdf-artifact-language-"));
const sourceCli = resolve(import.meta.dirname, "../bin/create-agdf.js");
try {
  const configDir = join(temporary, "defaults", ".agdf", "control");
  mkdirSync(configDir, { recursive: true });
  assert.equal(resolveConfiguredArtifactLanguage(join(temporary, "defaults")), "en", "missing config defaults to English");
  writeFileSync(join(configDir, "config.json"), "{ broken");
  assert.throws(() => resolveConfiguredArtifactLanguage(join(temporary, "defaults")), /configuration_invalid/, "corrupt JSON must not be silently defaulted");
  writeFileSync(join(configDir, "config.json"), JSON.stringify({ artifact_language: "not a tag!", chat_language: 'en', runtime_language: 'en' }));
  assert.throws(() => resolveConfiguredArtifactLanguage(join(temporary, "defaults")), /configuration_invalid/, "malformed recognized tags must be diagnosed");
  writeFileSync(join(configDir, "config.json"), JSON.stringify({ artifact_language: "de-DE", chat_language: 'en', runtime_language: 'en' }));
  assert.equal(resolveConfiguredArtifactLanguage(join(temporary, "defaults")), "de", "region subtags reduce to the language");
  const configuredRoot = join(temporary, "defaults");
  writeFileSync(join(configDir, "config.json"), JSON.stringify({ artifact_language: "en", chat_language: "de", runtime_language: "en" }));
  assert.deepEqual(resolveArtifactPresentationLanguages(configuredRoot), {
    artifact_language: "en", presentation_language: "de", approval_summary_required: true,
    approval_summary_heading: "AGDF Approval Summary (de; source=en)",
  }, "the configured chat default and artefact language are resolved together");
  const englishOverride = resolveArtifactPresentationLanguages(configuredRoot, "en-US");
  assert.equal(englishOverride.presentation_language, "en");
  assert.equal(englishOverride.artifact_language, "en");
  assert.equal(englishOverride.approval_summary_required, false);
  assert.equal(englishOverride.approval_summary_heading, null);
  assert.equal(resolveArtifactPresentationLanguages(configuredRoot, "fr").presentation_language, "en",
    "unsupported presentation tags use the same full English fallback as rendering");
  writeFileSync(join(configDir, "config.json"), JSON.stringify({ artifact_language: "de-DE", chat_language: "en", runtime_language: 'en' }));
  assert.equal(resolveArtifactPresentationLanguages(configuredRoot).approval_summary_heading, "AGDF Approval Summary (en; source=de)");
  assert.equal(resolveArtifactPresentationLanguages(configuredRoot, "de-DE").approval_summary_required, false);

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
  const germanUr = (root) => {
    const bodies = new Map([
      ["Problem", "Die Bibliothek bietet nur add und keine Subtraktion."],
      ["Goal", "Die Bibliothek exportiert zusätzlich subtract mit einem Test."],
      ["Affected Users", "Aufrufer der bestehenden Rechenbibliothek benötigen Subtraktion."],
      ["Scope", "Eine neue Funktion und ein Test, sonst keine Änderungen."],
      ["Non-Goals", "Keine Änderung an add und keine weiteren Rechenfunktionen."],
      ["Acceptance Signals", "Subtraktion ist als eigene Funktion mit einem passenden Test beschrieben."],
      ["Existing Source Of Truth", "Die bestehende add-Funktion und die Testkonvention bleiben maßgeblich."],
      ["Risks And Unknowns", "Keine materielle Bedarfsfrage ist offen; technische Eigentümer werden im Brownfield Review geprüft."],
      ["Next Step", "Den konkreten Bedarf prüfen, danach die bestehenden Eigentümer im Brownfield Review klären."],
    ]);
    // Author complete section bodies: template guidance and example paths are
    // not requirements, including when the template gains another paragraph.
    return readFileSync(join(root, ".agdf/control/templates/artefacts/UR.md"), "utf8")
      .replace("# UR: <Title>", "# UR: subtract ergänzen")
      .replace("Requirements clarification: open", "Requirements clarification: complete")
      .split(/^##[ \t]+/mu)
      .map((block, index) => {
        if (!index) return block;
        const heading = block.split("\n", 1)[0];
        const key = heading.replace(/^\d+\.[ \t]*/u, "").trim();
        assert.ok(bodies.has(key), `UR fixture must author the ${key} section`);
        return `## ${heading}\n\n${bodies.get(key)}\n\n`;
      }).join("");
  };

  const prepare = (name, language, content) => {
    const root = join(temporary, name);
    mkdirSync(root);
    execFileSync("git", ["init", "-q", root]);
    execFileSync(process.execPath, [sourceCli, "init", "--dir", root, "--language", language], { stdio: "pipe" });
    const created = { revision_id: spawnSync(process.execPath, [validator, "run-create", "--dir", root, "--run", "subtract"], { encoding: "utf8", env }).stdout.match(/revision_id: (\S+)/u)[1] };
    mkdirSync(join(root, ".agdf/control/artefacts/subtract"), { recursive: true });
    writeFileSync(join(root, ".agdf/control/artefacts/subtract/UR.md"), content ?? germanUr(root));
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

  // Reproduce the first cockpit draft: complete English requirements, German review,
  // but no translated summary. Authoring resumes before a terminal renderer error.
  const englishContent = "# UR: Local control cockpit\n\nStatus: draft\nGate approval: open\nRequirements clarification: complete\n\n"
    + [
      ["Problem", "Users must search separate run files to understand delivery progress."],
      ["Goal", "A local read-only cockpit shows current run information and evidence."],
      ["Affected Users", "The repository maintainer and delivery reviewers."],
      ["Scope", "Run overview, run details and registered artefacts from existing Core readers."],
      ["Non-Goals", "Editing, approval submission, deployment and new governance rules."],
      ["Acceptance Signals", "Users can inspect a run and its documents without changing control files."],
      ["Existing Source Of Truth", "Canonical control records and existing Core evaluation services."],
      ["Risks And Unknowns", "Design must address concurrent updates and bounded document reading."],
      ["Next Step", "Review this requirement before Brownfield Review and product definition."],
    ].map(([heading, body]) => `## ${heading}\n\n${body}\n`).join("\n");
  const english = prepare("english", "en", englishContent);
  const configPath = join(english.root, ".agdf/control/config.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  writeFileSync(configPath, JSON.stringify({ ...config, chat_language: "de" }));
  const urPath = join(english.root, ".agdf/control/artefacts/subtract/UR.md");
  const statePath = join(english.root, ".agdf/control/runs/subtract/RUN_STATE.md");
  const resume = revision => call("skill-dispatch", "--json", "--skill", "gate-check", "--surface", "codex", "--language", "de",
    "--working-directory", english.root, "--target-source", "explicit_target", "--primary-target", english.root,
    "--intake", "--intake-mode", "resume", "--run", "subtract", "--revision", revision);
  const assertAuthoring = dispatch => {
    assert.equal(dispatch.outcome, "skill_continuation", JSON.stringify(dispatch));
    assert.equal(dispatch.terminal, false);
    assert.equal(dispatch.continuation.phase, "ur_definition");
    assert.equal(dispatch.control.blocking_reason, "AGDF_UR_REQUIREMENTS_INCOMPLETE");
    assert.equal(dispatch.continuation.artifact_language, "en");
    assert.equal(dispatch.continuation.presentation_language, "de");
    assert.equal(dispatch.continuation.approval_summary_required, true);
    assert.equal(dispatch.continuation.approval_summary_heading, "AGDF Approval Summary (de; source=en)");
    assert.match(dispatch.continuation.runtime_contracts[0].content, /Before recording a complete draft/u);
    assert.equal(dispatch.presentation, null, "incomplete summary cannot request approval");
  };
  assertAuthoring(english.dispatch);
  const before = [readFileSync(urPath), readFileSync(statePath), readFileSync(configPath)];
  assertAuthoring(resume(english.revision));
  assert.deepEqual([readFileSync(urPath), readFileSync(statePath), readFileSync(configPath)], before,
    "language preparation and routing do not write control state");
  assert.notEqual(call("run-present", "--dir", english.root, "--run", "subtract", "--gate", "UR",
    "--revision", english.revision, "--language", "de").outcome, "prepared", "direct presentation still fails closed");
  let revision = english.revision;
  const recordSummary = summary => {
    writeFileSync(urPath, englishContent + summary);
    const updated = call("run-update", "--dir", english.root, "--run", "subtract", "--revision", revision);
    assert.equal(updated.outcome, "updated", JSON.stringify(updated));
    revision = updated.revision_id;
    return resume(revision);
  };
  const summary = "\n## AGDF Approval Summary (de; source=en)\n- Problem: Run-Informationen liegen in getrennten Dateien.\n- Ziel: Ein lokales lesendes Cockpit macht Run, Dokumente und Evidenz sichtbar.\n- Umfang: Übersicht, Details und Artefakte aus bestehenden Core-Diensten.\n";
  for (const invalid of [summary.replace("source=en", "source=de"), summary + summary,
    summary.replace("sichtbar.", "sichtbar..."), "\n## AGDF Approval Summary (de; source=en)\n"]) {
    assertAuthoring(recordSummary(invalid));
  }
  const ready = recordSummary(summary);
  assert.equal(ready.continuation.phase, "presentation_required", JSON.stringify(ready));
  const fresh = call("run-present", "--dir", english.root, "--run", "subtract", "--gate", "UR", "--revision", revision, "--language", "de");
  assert.equal(fresh.outcome, "prepared", JSON.stringify(fresh));
  assert.match(fresh.text, /Ein lokales lesendes Cockpit/u);
  assert.equal(fresh.summary_digest, ready.presentation.summary_digest, "prepared summary matches the checked preview");
  assert.equal(JSON.parse(readFileSync(configPath, "utf8")).artifact_language, "en", "repair does not change project language");
  // Same-language PRD content errors still retain their concrete recovery heading;
  // a null optional authoring heading must not erase presentation diagnostics.
  const prdPath = ".agdf/control/artefacts/subtract/PRD.md";
  writeFileSync(join(english.root, prdPath), "# PRD\n\n## Acceptance Criteria\nMissing canonical criterion IDs.\n");
  assert.throws(() => renderReviewableApproval(english.root,
    { approval_presentation: { presentation_language: "en" } },
    { runId: "subtract", gate: "PRD", revisionId: revision },
    { artefacts: new Map([["PRD", { path: prdPath }]]) }), error => {
      assert.equal(error.message, "approval_summary_source_criteria_invalid");
      assert.match(error.recovery, /AGDF Approval Summary \(en; source=en\)/u);
      return true;
    });
  console.log("artifact language tests passed (config resolution, pre-presentation authoring, invalid summaries, fresh binding)");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
