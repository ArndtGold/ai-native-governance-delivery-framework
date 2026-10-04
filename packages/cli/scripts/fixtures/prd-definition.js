import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { artefactFileDigest } from "../../../core/lib/control-state/run-seal.js";
import { resolveControlCommandTarget } from "../../../core/lib/control-state/approval-command-contract.js";

// Synthetic authorization in isolated test runs only; never a human production approval.
export function createPrdDefinitionTestRun(root, validator, runId = "prd-authoring-test", env = process.env) {
  const log = [];
  const call = (command, ...args) => {
    const result = spawnSync(process.execPath, [validator, command, "--dir", root, "--json", ...args], { encoding: "utf8", env });
    assert.equal(result.error, undefined);
    let value;
    try { value = JSON.parse(result.stdout); } catch { value = null; }
    log.push({ command, args, code: result.status, value, stderr: result.stderr });
    return { code: result.status, value, text: result.stdout + result.stderr };
  };
  const state = join(root, `.agdf/control/runs/${runId}/RUN_STATE.md`);
  const prefix = `.agdf/control/artefacts/${runId}/`;
  const file = name => join(root, prefix, name);
  const revision = () => readFileSync(state, "utf8").match(/^- revision_id: (.+)$/mu)[1];
  const run = (command, ...args) => call(command, "--run", runId, ...args);
  const created = run("run-create"); assert.equal(created.code, 0, created.text);
  mkdirSync(join(root, prefix), { recursive: true });
  writeFileSync(file("UR.md"), "# UR: Synthetic saved-filter need\n\n## Problem\nOperators repeatedly recreate the same filter.\n\n## Goal\nAn operator can save and restore one named filter.\n\n## Scope\nOne user-owned saved filter, no sharing.\n\n## Non-Goals\nNo shared filters or permissions change.\n");
  assert.equal(run("run-step", "--revision", revision(), "--step", "ur", "--title", "Synthetic saved filter").code, 0);
  const approve = (gate, presentation, rev = revision(), response = `Approval: ${gate}`) => run("run-approve",
    "--revision", rev, "--gate", gate, "--presentation", presentation, "--response", response);
  const present = (gate = "PRD", language = "en") => run("run-present", "--revision", revision(), "--gate", gate, "--language", language);
  const ur = present("UR"); assert.equal(ur.value?.outcome, "prepared", ur.text);
  assert.equal(approve("UR", ur.value.presentation_id).value?.outcome, "approved");
  writeFileSync(file("BROWNFIELD_REVIEW.md"), "# Brownfield Review\n\nSynthetic existing filter owner.\n- ux_intent_definition_required: no\n");
  assert.equal(run("run-step", "--revision", revision(), "--step", "route", "--route", "structured_delivery", "--reason",
    "Synthetic public-contract test route, never live authorization", "--evidence", prefix + "BROWNFIELD_REVIEW.md").value?.outcome, "recorded");
  const recording = (update = false, mutate = () => {}) => {
    const proof = prefix + `mapping-${randomUUID()}.json`, input = prefix + `recording-${randomUUID()}.json`;
    const value = { schema_version: "1", target_id: resolveControlCommandTarget(root).target_id, run_id: runId,
      expected_revision_id: revision(), destination: { type: "PRD", path: prefix + "PRD.md", digest: artefactFileDigest(root, prefix + "PRD.md"), status: "draft" },
      source: { type: "UR", path: prefix + "UR.md", digest: artefactFileDigest(root, prefix + "UR.md") },
      relationship: { from: "PRD", relationship: "derived_from", to: "UR" },
      review: { reviewer: "synthetic test reviewer", path: proof, digest: "" }, update_draft: update };
    const { schema_version, target_id, run_id, relationship, destination, source } = value;
    writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, relationship, destination, source, reviewer: value.review.reviewer, reviewed: true }));
    value.review.digest = artefactFileDigest(root, proof);
    mutate(value);
    writeFileSync(join(root, input), JSON.stringify(value));
    return { value, path: input };
  };
  const record = (update = false, mutate) => {
    const input = recording(update, mutate);
    return run("run-step", "--revision", revision(), "--step", "artefact", "--gate", "PRD", "--evidence", input.path);
  };
  return { root, runId, prefix, state, file, revision, run, call, log, present, approve, record, recording };
}

export const syntheticPrd = (open = false) => `# PRD: Synthetic saved filter

Status: draft
Gate: PRD
Gate approval: open
Owner: Test product owner
Traceability contract: criteria-chain-v1

## Product Scope
Save and restore one named user-owned filter. No sharing or permissions change.

## Acceptance Criteria
- criterion_id: AC-001
- requirement: Saving and restoring reproduces the selected filter values for the same user.
- observable_success: The restored filter values equal the saved values.

## Approval Decisions
| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Saved-filter ownership | before_prd | ${open ? "open" : "resolved"} | ${open ? "" : "Only the saving user owns the filter"} | Test product owner |

## AGDF Approval Summary (de; source=en)
- Ziel: Einen persönlichen Filter speichern und wiederherstellen.
- Umfang: Ein benannter Filter ohne Freigabe für andere Nutzer.
- AC-001: Wiederherstellung reproduziert die gespeicherten Filterwerte desselben Nutzers.
- Entscheidungen: ${open ? "Die Produktentscheidung zur Eigentümerschaft ist offen." : "Persönliche Eigentümerschaft ist geklärt."}
`;
