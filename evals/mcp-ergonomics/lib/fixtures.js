// Deterministic fixture repositories F1 to F5 (SDD-003, TP section 1a). Every fixture is a fresh
// temporary repository built through the canonical CLI and the existing fixture builders; the
// repository's own .agdf/control is never a measured target.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync, lstatSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPrdDefinitionTestRun, syntheticPrd } from "../../../packages/cli/scripts/fixtures/prd-definition.js";
import { createExpandedSourceRevisionFixture } from "../../../packages/cli/scripts/fixtures/expanded-source-revision.js";
import { sourceRevisionTestProposal } from "../../../packages/cli/scripts/fixtures/late-source-revision.js";
import { readRunState } from "../../../packages/core/lib/control-evaluation/run-state.js";
import { sourceRevisionQualityFacts } from "../../../packages/core/lib/control-state/run-source-revisions.js";
import { resolveControlCommandTarget } from "../../../packages/core/lib/control-state/approval-command-contract.js";
import { artefactFileDigest } from "../../../packages/core/lib/control-state/run-seal.js";
import { repoRoot } from "./protocol-harness.js";

export const CLI = join(repoRoot, "packages", "cli", "bin", "create-agdf.js");
export const DEMO_RUN = "demo-run-01";

function cli(root, command, ...args) {
  const result = spawnSync(process.execPath, [CLI, command, "--dir", root, "--json", ...args], { encoding: "utf8" });
  let value = null;
  try { value = JSON.parse(result.stdout); } catch {}
  return { code: result.status, value, text: `${result.stdout}${result.stderr}` };
}

// Roots created while buildFixture runs, so a failing builder leaves no temporary directory behind.
let pendingRoots = null;

function governedRoot(kind) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), `agdf-mcp-ergonomics-${kind}-`)));
  pendingRoots?.push(root);
  assert.equal(spawnSync("git", ["init", "-q", root]).status, 0);
  const init = spawnSync(process.execPath, [CLI, "init", "--dir", root, "--language", "en"], { encoding: "utf8" });
  assert.equal(init.status, 0, init.stderr);
  return root;
}

const revisionOf = (root, runId) => readFileSync(join(root, `.agdf/control/runs/${runId}/RUN_STATE.md`), "utf8")
  .match(/^- revision_id: (.+)$/mu)[1].trim();

const UR_SUMMARY = "## AGDF Approval Summary (de; source=en)\n- Problem: Derselbe Filter muss wiederholt aufgebaut werden.\n"
  + "- Ziel: Einen benannten persönlichen Filter speichern und wiederherstellen.\n- Umfang: Ein Filter ohne Teilen oder Berechtigungsänderung.\n";

function urText(longDocument) {
  const filler = longDocument
    ? `\n## Background\n${Array.from({ length: 460 }, (_, index) => `- Observation ${String(index + 1).padStart(3, "0")}: operators rebuild the same saved filter by hand, `
      + "which costs time, invites mistakes and makes repeated reviews inconsistent across shifts and teams.").join("\n")}\n`
    : "";
  return "# UR: Synthetic saved-filter need\n\n## Problem\nOperators repeatedly recreate the same filter.\n\n## Goal\n"
    + "An operator can save and restore one named filter.\n\n## Scope\nOne user-owned saved filter, no sharing.\n\n## Non-Goals\n"
    + `No shared filters or permissions change.\n${filler}\n${UR_SUMMARY}`;
}

// F3 / F4: run at UR with a prepared presentation.
function presentedUr(kind, longDocument) {
  const root = governedRoot(kind);
  assert.equal(cli(root, "run-create", "--run", DEMO_RUN).code, 0);
  const prefix = `.agdf/control/artefacts/${DEMO_RUN}/`;
  mkdirSync(join(root, prefix), { recursive: true });
  writeFileSync(join(root, prefix, "UR.md"), urText(longDocument));
  const step = cli(root, "run-step", "--run", DEMO_RUN, "--revision", revisionOf(root, DEMO_RUN), "--step", "ur", "--title", "Synthetic saved filter");
  assert.equal(step.code, 0, step.text);
  const present = cli(root, "run-present", "--run", DEMO_RUN, "--revision", revisionOf(root, DEMO_RUN), "--gate", "UR", "--language", "de");
  assert.equal(present.value?.outcome, "prepared", present.text);
  return { root, runId: DEMO_RUN, presentationId: present.value.presentation_id, documentBytes: present.value.document_bytes };
}

function runAtPrd(kind) {
  const root = governedRoot(kind);
  const f = createPrdDefinitionTestRun(root, CLI, DEMO_RUN, process.env, { route: "structured_slice" });
  writeFileSync(f.file("PRD.md"), syntheticPrd());
  const recorded = f.record();
  assert.equal(recorded.value?.outcome, "recorded", recorded.text);
  return { root, runId: DEMO_RUN, f };
}

function runAtOr(kind) {
  const root = governedRoot(kind);
  const seeds = mkdtempSync(join(tmpdir(), "agdf-mcp-ergonomics-seeds-"));
  try {
    const fixture = createExpandedSourceRevisionFixture(root, CLI, seeds);
    fixture.approve("UAT");
    const state = readRunState(root, { runId: fixture.f.runId });
    const qaPath = state.artefacts.get("QA")?.path;
    const rows = ["UR", "Brownfield Review", "PRD", "SD", "TP", "Brownfield Analysis", "CD+Tests", "CR", "QA", "UAT"]
      .map(type => `| ${type} | ${state.approvals.get(type)?.status ?? state.artefacts.get(type)?.status} | ${state.artefacts.get(type)?.path || state.approvals.get(type)?.evidence} |`).join("\n");
    const orPath = `${fixture.f.prefix}OR_CANDIDATE.md`;
    writeFileSync(join(root, orPath), `# OR: Synthetic closeout
Report mode: OR-full
Status: done
## Run
- run_id: ${fixture.f.runId}
- related_ur: ${fixture.f.prefix}UR.md
- related_prd: ${fixture.f.prefix}PRD.md
- related_sd: ${fixture.f.prefix}SD.md
- related_tp: ${fixture.f.prefix}TP.md
- related_qa_report: ${qaPath}
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass
## Gate State
| Gate or step | Status | Evidence |
|---|---|---|
${rows}
## Delivered
Synthetic exact approved fixture task and checks complete.
## Not Delivered / Intentionally Deferred
none
## Evidence
Actual fixture QA and all mandatory reviews are registered and approved.
## Missing Evidence
none
## Risks And Open Items
none
## Context Graph Impact
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Synthetic isolated scope changes no graph owner or knowledge.
## Knowledge Persistence Decision
- memory_target: none
- memory_reason: Synthetic disposable fixture creates no persistent project knowledge.
- memory_refs: none
## Next Permissible Step
- next_allowed_action: Optional explicitly requested VCS handoff.
- required_approval: none
- forbidden_until_then: Automatic Git or release action.
`);
    return { root, runId: fixture.f.runId, orPath };
  } finally { rmSync(seeds, { recursive: true, force: true }); }
}

export const FIXTURE_BUILDERS = Object.freeze({
  F1: () => ({ root: governedRoot("f1"), runId: null }),
  F2: () => runAtPrd("f2"),
  F3: () => presentedUr("f3", false),
  F4: () => presentedUr("f4", true),
  F5: () => runAtOr("f5"),
});

// A built fixture with snapshot/restore of its control tree, so every execution starts identically.
export function buildFixture(id) {
  if (!Object.hasOwn(FIXTURE_BUILDERS, id)) throw new Error(`unknown fixture: ${id}`);
  pendingRoots = [];
  let built, snapshot, targetId, controlIdentities, receiptIdentity;
  try {
    built = FIXTURE_BUILDERS[id]();
    snapshot = mkdtempSync(join(tmpdir(), `agdf-mcp-ergonomics-${id.toLowerCase()}-snapshot-`));
    cpSync(join(built.root, ".agdf"), join(snapshot, ".agdf"), { recursive: true });
    targetId = resolveControlCommandTarget(built.root).target_id;
    controlIdentities = ['.agdf', '.agdf/control'].map(path => { const stat = lstatSync(join(built.root, path), { bigint: true });
      return { path, dev: stat.dev, ino: stat.ino }; });
    const receiptPath = '.agdf/control/.agdf-canonical-init.json';
    const receiptStat = lstatSync(join(built.root, receiptPath), { bigint: true });
    assert.ok(receiptStat.isFile() && !receiptStat.isSymbolicLink() && receiptStat.nlink === 1n);
    receiptIdentity = { path: receiptPath, dev: receiptStat.dev, ino: receiptStat.ino,
      bytes: readFileSync(join(built.root, receiptPath)) };
  } catch (error) {
    for (const path of [...pendingRoots, snapshot]) if (path) rmSync(path, { recursive: true, force: true });
    throw error;
  } finally { pendingRoots = null; }
  const extra = {};
  if (built.f) extra.f = built.f;
  return Object.freeze({
    id, ...built, ...extra,
    targetId,
    revision: () => (built.runId ? revisionOf(built.root, built.runId) : null),
    restore() {
      // Initialization receipts bind these directory identities. Reset owned
      // fixture contents in place; never forge or discard a terminal receipt.
      for (const owner of controlIdentities) {
        const stat = lstatSync(join(built.root, owner.path), { bigint: true });
        assert.equal(stat.isDirectory() && !stat.isSymbolicLink() && stat.dev === owner.dev && stat.ino === owner.ino, true,
          'fixture directory ownership changed before reset');
      }
      // The receipt is also the self-bound ownership anchor. Identical copied
      // bytes have a different inode and cannot establish original ownership.
      const receiptPath = join(built.root, receiptIdentity.path);
      const receiptStat = lstatSync(receiptPath, { bigint: true });
      assert.ok(receiptStat.isFile() && !receiptStat.isSymbolicLink() && receiptStat.nlink === 1n
        && receiptStat.dev === receiptIdentity.dev && receiptStat.ino === receiptIdentity.ino
        && readFileSync(receiptPath).equals(receiptIdentity.bytes), 'fixture initialization ownership changed before reset');
      for (const path of ['.agdf', '.agdf/control']) for (const name of readdirSync(join(built.root, path))) {
        if (path === '.agdf' && name === 'control') continue;
        if (join(built.root, path, name) === receiptPath) continue;
        rmSync(join(built.root, path, name), { recursive: true, force: true });
      }
      cpSync(join(snapshot, ".agdf"), join(built.root, ".agdf"), { recursive: true,
        filter: source => source !== join(snapshot, receiptIdentity.path) });
    },
    dispose() { rmSync(built.root, { recursive: true, force: true }); rmSync(snapshot, { recursive: true, force: true }); },
  });
}

// Reviewed schema-2 UR revision proposal for a valid agdf_revise preview on F2.
export function writeUrRevisionProposal(fixture, operationId) {
  const f = { ...fixture.f, control: () => readRunState(fixture.root, { runId: fixture.runId }), revision: () => fixture.revision() };
  const state = f.control();
  const proposal = sourceRevisionTestProposal(fixture.root, f, "UR", "reassess", operationId);
  const source = proposal.value.sources.find(row => row.type === "UR");
  const read = path => { try { return readFileSync(join(fixture.root, path), "utf8"); } catch { return undefined; } };
  const statement = read(source.path).replace(/^﻿/u, "").split("\n").find(line => line.trim());
  Object.assign(proposal.value, { schema_version: "2", policy_version: 2, initiating_phase: state.current_gate,
    changed_statements: [{ ...source, statement, intended_change: "Clarify the concrete fixture statement", reason: "Actual fixture source change" }],
    quality_assessment: sourceRevisionQualityFacts(state, read).map(row => ({ ...row, disposition: "reassess",
      reason: "Renew affected or unassociated current proof under the changed source" })) });
  writeFileSync(join(fixture.root, proposal.input.evidence), JSON.stringify(proposal.value));
  return { path: proposal.input.evidence, digest: artefactFileDigest(fixture.root, proposal.input.evidence) };
}

export function writeEvidenceNote(fixture, name, text) {
  const path = `.agdf/control/artefacts/${fixture.runId}/${name}`;
  writeFileSync(join(fixture.root, path), text);
  return { path, digest: artefactFileDigest(fixture.root, path) };
}
