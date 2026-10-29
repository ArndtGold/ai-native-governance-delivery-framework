import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { approvalFixture, fixture } from "../../core/test/control-cockpit-fixtures.js";
import { readRunState } from "../../core/lib/control-evaluation/run-state.js";
import { LIFECYCLES as CORE_LIFECYCLES } from "../../core/lib/control-state/run-state-parser.js";
import { replaceFirstScalar } from "../../core/lib/control-state/run-state-edits.js";
import { createRun } from "../../core/lib/control-state/run-state-repository.js";
import { recordRunPresentationDecision, recordRunStep } from "../../core/lib/control-state/run-steps.js";
import { evaluateGateCheck } from "../../core/lib/control-evaluation/gate-check.js";
import { policyForRunContent } from "../../core/lib/control-evaluation/run-step-policy.js";
import { modeSliceDecision } from "../../core/lib/control-evaluation/run-state-policy.js";
import { isDecisionContentPlaceholder } from "../../core/lib/control-evaluation/decision-content-readiness.js";
import { parseRunState as parseCoreRunState } from "../../core/lib/control-state/run-state-parser.js";
import { prepareRunPresentation } from "../../core/lib/control-state/run-presentation.js";
import { approveRunGate } from "../../core/lib/control-state/run-recording.js";
import { sealRunState } from "../../core/lib/control-state/run-seal.js";
import { previewRunClosure, applyRunClosure } from "../../core/lib/control-state/run-closure.js";
import { isOperationalValueRenderable } from "../../core/lib/interaction-presentation.js";
import { resolveConfiguredChatLanguage } from "../../core/lib/resources/context.js";
import { claudePluginDataRoot } from "../lib/mcp-lifecycle/plugin-runtime.js";

// The Claude companion's logic and host adapter (T-006): parity with the canonical writers and the
// core reader, state rules, assignment, localization, gate bar, figure, terminal text, persistence
// and the adapter against a fake host. The companion source is host-independent ES modules.
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const companionDir = join(repoRoot, "plugins", "agdf", "host-templates", "claude", "companion");
const companion = name => import(pathToFileURL(join(companionDir, name)).href);
const { BUILD_GATES, LIFECYCLES, MAX_RUN_STATE_BYTES, isPlaceholderText, parseRunState, readSnapshot, settleSnapshot } = await companion("run-state.mjs");
const { displayState, runState } = await companion("state.mjs");
const { assignRun, namedRun, openRuns, stepSelection } = await companion("assignment.mjs");
const { chatLocale, label, localizeNextStep, settingLocale } = await companion("localization.mjs");
const { condensedGateBar, fullGateBar, gateBar, gateMarks } = await companion("gate-bar.mjs");
const { ACCESSORY_BOUNDS, ACCESSORY_REGION, BRICKS, BRICK_SIZE, FIGURE_BOX, FIGURE_TEXT, HAMMER, figureSvg } = await companion("figure.mjs");
const { CHIME, chimeClip, noticeText, observeNotice, observedRun, statusText } = await companion("notice.mjs");
const { buildPanelView, terminalText } = await companion("view.mjs");
const { STATE_FILE, parseCompanionState, pluginDataDir, serializeCompanionState } = await companion("persistence.mjs");
const registry = JSON.parse(readFileSync(join(repoRoot, "plugins", "agdf", "meta", "agdf-interaction-locales.json"), "utf8"));
const labels = JSON.parse(readFileSync(join(companionDir, "locales.json"), "utf8"));

const nodeFs = {
  exists: async path => existsSync(path),
  list: async path => readdirSync(path).map(name => ({ name, kind: lstatSync(join(path, name)).isDirectory() ? "dir" : "file", isLink: lstatSync(join(path, name)).isSymbolicLink() })),
  read: async path => readFileSync(path, "utf8"),
};
const runFile = (root, id) => join(root, ".agdf", "control", "runs", id, "RUN_STATE.md");
const parsed = (root, id) => parseRunState(id, readFileSync(runFile(root, id), "utf8"));
function setScalar(root, id, key, value) {
  writeFileSync(runFile(root, id), sealRunState(root, replaceFirstScalar(readFileSync(runFile(root, id), "utf8"), key, value)));
}
const run = (overrides = {}) => ({ id: "r", lifecycle: "active", gate: "SD", decision: "in_progress", route: "structured_delivery", updatedAt: "2026-10-26T08:00:00.000Z",
  missing: "No approval is pending.", next: "Draft the UR.", approved: ["UR", "PRD"], objective: "Show the run state.", ...overrides });
function treeDigest(root) {
  const hash = createHash("sha256");
  const walk = path => { for (const name of readdirSync(path).sort()) {
    const file = join(path, name);
    if (lstatSync(file).isDirectory()) walk(file); else hash.update(relative(root, file)).update(readFileSync(file));
  } };
  walk(join(root, ".agdf", "control"));
  return hash.digest("hex");
}

// SCN-005: fixtures written by the canonical writers parse to the core reader's values and moods.
const created = fixture();
const approval = await approvalFixture();
try {
  const states = [];
  for (const [rootFixture, id, expectedMood, label] of [
    [created, "fixture-a", "laeuft", "created"],
    [created, "fixture-completed", "fertig", "completed"],
    [approval, "fixture-a", "wartet", "UR open"],
  ]) states.push({ root: rootFixture.root, id, expectedMood, label });
  // Revise, block and awaiting states: a canonical run with the decision set by the core test builders.
  for (const [decision, expectedMood] of [["revise", "blockiert"], ["block", "blockiert"], ["blocked", "blockiert"], ["decline", "blockiert"],
    ["pending", "wartet"], ["awaiting_uat", "wartet"]]) {
    const id = `fixture-${decision.replace("_", "-")}`;
    createRun(created.root, id);
    setScalar(created.root, id, "decision", decision);
    states.push({ root: created.root, id, expectedMood, label: decision });
  }
  const checkParity = ({ root, id, expectedMood, label: name }) => {
    const result = parsed(root, id);
    assert.equal(result.ok, true, `${name}: canonical run state must parse`);
    const core = readRunState(root, { runId: id });
    for (const [mine, theirs] of [["lifecycle", "lifecycle"], ["gate", "current_gate"], ["decision", "decision"], ["updatedAt", "updated_at"]]) {
      assert.equal(result.run[mine], String(core.meta[theirs] ?? "").replace(/`/gu, "").trim(), `${name}: ${theirs} parity`);
    }
    const approvedByCore = [...core.approvals.entries()].filter(([, row]) => row.status === "approved").map(([gate]) => gate);
    assert.deepEqual([...result.run.approved].sort(), approvedByCore.sort(), `${name}: approved gates parity`);
    if (expectedMood !== null) assert.equal(runState(result.run).mood, expectedMood, `${name}: mood`);
    return { result, core };
  };
  for (const state of states) checkParity(state);
  // Run steps keep the control table's next step equal to the core's next allowed action.
  assert.equal(checkParity(states[2]).result.run.next, readRunState(approval.root, { runId: "fixture-a" }).next_allowed_action);
  assert.equal(approval.approve().outcome, "approved");
  const approved = checkParity({ root: approval.root, id: "fixture-a", expectedMood: "laeuft", label: "UR approved" });
  assert.deepEqual(approved.result.run.approved, ["UR"]);
  assert.equal(approved.result.run.next, approved.core.next_allowed_action);
  // The approval fixture is routed as a quick task: its bar is the status card's compact path.
  assert.deepEqual(gateMarks(approved.result.run), [{ gate: "UR", mark: "done" }, { gate: "Compact Delivery", mark: "current" }]);

  // CR-F02: the canonical writers keep a review result in the step's Artefacts row and a declined
  // presentation in the control table; the Run Meta decision stays `in_progress`. Both read as blockiert.
  const review = recordRunStep(approval.root, { runId: "fixture-a", revisionId: approval.revision(), step: "review", decision: "revise", evidence: "review found a defect" },
    { policy: policyForRunContent, date: "2026-10-26" });
  assert.equal(review.outcome, "recorded", JSON.stringify(review));
  const revised = checkParity({ root: approval.root, id: "fixture-a", expectedMood: "blockiert", label: "Quick Task review revise" });
  assert.deepEqual([revised.result.run.decision, revised.result.run.gate, revised.result.run.gateResult], ["in_progress", "Quick Task Execution", "revise"]);
  assert.equal(revised.result.run.gateResult, revised.core.artefacts.get("CR").status, "the CR row status equals the core reader's");
  assert.deepEqual(runState(revised.result.run).reason, { key: "blocked", gate: "Quick Task Execution", decision: "revise" });
  const declined = await approvalFixture();
  try {
    const rejected = recordRunPresentationDecision(declined.root, { runId: "fixture-a", revisionId: declined.revision(), operationId: "0b7b0c1e-4f2a-4d1b-9c3e-2a6f8d9e1b47",
      gate: "UR", presentationId: declined.presentationId, action: "reject", comment: "", requestDigest: `sha256:${"a".repeat(64)}` }, { evaluateGateCheck });
    assert.equal(rejected.outcome, "recorded", JSON.stringify(rejected));
    const decline = checkParity({ root: declined.root, id: "fixture-a", expectedMood: "blockiert", label: "UR declined" });
    assert.deepEqual([decline.result.run.gateDecision, runState(decline.result.run).reason.decision], ["reject", "decline"]);
  } finally {
    declined.close();
  }

  // TPR-F01, CIR-F01: the companion accepts exactly the core lifecycles. Superseded and abandoned
  // runs parse with core parity, are closed, are never assigned (even when changed in this session)
  // and drop a remembered selection.
  assert.deepEqual([...LIFECYCLES].sort(), [...CORE_LIFECYCLES].sort(), "companion lifecycles equal the core set");
  for (const lifecycle of ["superseded", "abandoned"]) {
    const id = `fixture-${lifecycle}`;
    createRun(created.root, id);
    setScalar(created.root, id, "lifecycle", lifecycle);
    const { result } = checkParity({ root: created.root, id, expectedMood: null, label: lifecycle });
    assert.equal(result.run.lifecycle, lifecycle);
    const shown = assignRun({ runs: [result.run], sessionStartedAt: 0, selection: id });
    assert.deepEqual([shown.run, shown.origin, shown.open, shown.dropSelection], [null, "none", [], true], `${lifecycle}: closed and never assigned`);
  }
  // AC-010 (run closure): a run closed through the real closure operation leaves the open-run list.
  createRun(created.root, "fixture-closed");
  const closurePreview = previewRunClosure(created.root, { entries: [{ run_id: "fixture-closed", outcome: "abandoned", reason: "Companion regression" }] });
  assert.equal(applyRunClosure(created.root, { previewId: closurePreview.preview_id, confirmation: closurePreview.confirmation_phrase },
    { readIdentity: () => ({ statement: "unknown" }) }).results[0].result, "closed");
  const afterClosure = await readSnapshot(nodeFs, created.root, { now: 1 });
  assert.equal(afterClosure.runs.find(entry => entry.id === "fixture-closed")?.lifecycle, "abandoned");
  assert.ok(!openRuns(afterClosure.runs).some(entry => entry.id === "fixture-closed"), "a closed run is not an open run");
  const closedSelection = assignRun({ runs: afterClosure.runs, sessionStartedAt: 0, selection: "fixture-closed" });
  assert.notEqual(closedSelection.run?.id, "fixture-closed"); assert.equal(closedSelection.dropSelection, true);

  // SCN-009 / SCN-006 inputs: reader conditions on the fixture targets.
  const noControl = mkdtempSync(join(tmpdir(), "agdf-companion-plain-"));
  assert.deepEqual(await readSnapshot(nodeFs, noControl, { now: 1 }), { status: "no_control", root: noControl, runs: [], unreadable: [], readAt: 1 });
  mkdirSync(join(noControl, ".agdf", "control"), { recursive: true });
  const empty = await readSnapshot(nodeFs, noControl, { now: 1 });
  assert.deepEqual([empty.status, empty.runs.length], ["ok", 0]);
  mkdirSync(join(noControl, ".agdf", "control", "runs", "broken"), { recursive: true });
  writeFileSync(runFile(noControl, "broken"), "# not a run state\n");
  mkdirSync(join(noControl, ".agdf", "control", "runs", "missing"), { recursive: true });
  const broken = await readSnapshot(nodeFs, noControl, { now: 1 });
  assert.deepEqual(broken.unreadable.sort((a, b) => a.id.localeCompare(b.id)), [{ id: "broken", reason: "format" }, { id: "missing", reason: "missing" }]);
  assert.deepEqual(parseRunState("big", "x".repeat(MAX_RUN_STATE_BYTES + 1)), { ok: false, id: "big", reason: "too_large" });
  assert.equal(parseRunState("other", readFileSync(runFile(created.root, "fixture-a"), "utf8")).ok, false, "run id must match its folder");
  const failing = await readSnapshot({ ...nodeFs, list: async () => { throw new Error("EIO"); } }, created.root, { now: 2 });
  assert.equal(failing.status, "failed");
  const good = await readSnapshot(nodeFs, created.root, { now: 1 });
  const stale = settleSnapshot(good, failing);
  assert.deepEqual([stale.status, stale.stale.failedAt, stale.runs.length], ["ok", 2, good.runs.length]);
  assert.equal(settleSnapshot(null, failing), failing);
  rmSync(noControl, { recursive: true, force: true });

  // SCN-006 and chat-run navigation SCN-012: a main-loop turn shows läuft, except that a run waiting for
  // an approval or a decision stays wartet (the chat asks for it during that turn) and a run being built
  // stays baut; blocked, working and done runs show läuft; the run-derived state returns afterwards.
  const waiting = run({ missing: "Exact Approval: SD." });
  assert.deepEqual(displayState(waiting, { isTurnActive: true }), { mood: "wartet", reason: { key: "waitingApproval", gate: "SD" } });
  assert.deepEqual(displayState(run({ decision: "pending" }), { isTurnActive: true }), { mood: "wartet", reason: { key: "waitingDecision", gate: "SD" } });
  for (const overrides of [{ decision: "revise" }, { decision: "in_progress" }, { lifecycle: "completed" }]) {
    assert.deepEqual(displayState(run(overrides), { isTurnActive: true }), { mood: "laeuft", reason: { key: "turnActive" } }, JSON.stringify(overrides));
  }
  assert.deepEqual(displayState(waiting), { mood: "wartet", reason: { key: "waitingApproval", gate: "SD" } });
  assert.deepEqual(runState(run({ decision: "mystery" })), { mood: null, reason: { key: "unknownState" } });
  assert.equal(displayState(run({ decision: "mystery" }), { isTurnActive: true }).mood, null, "a turn never hides an unreadable state");
  assert.equal(runState(run({ lifecycle: "completed", decision: "revise" })).mood, "fertig");

  // SCN-007: assignment per session.
  const start = Date.parse("2026-10-26T08:00:00.000Z");
  const before = run({ id: "before", updatedAt: "2026-10-26T07:59:59.000Z" });
  const changedA = run({ id: "a", updatedAt: "2026-10-26T08:00:00.000Z" });
  const changedB = run({ id: "b", updatedAt: "2026-10-26T08:05:00.000Z" });
  const legacy = run({ id: "legacy", updatedAt: "" });
  const doneInSession = run({ id: "done", lifecycle: "completed", updatedAt: "2026-10-26T08:06:00.000Z" });
  assert.deepEqual(assignRun({ runs: [before, changedA, changedB], sessionStartedAt: start }).run.id, "b");
  assert.equal(assignRun({ runs: [before, changedA, changedB, doneInSession], sessionStartedAt: start }).run.id, "done", "a run completed in this session stays assigned");
  const remembered = assignRun({ runs: [before, legacy], sessionStartedAt: start, selection: "before" });
  assert.deepEqual([remembered.run.id, remembered.origin, remembered.dropSelection], ["before", "selected", false]);
  assert.equal(assignRun({ runs: [before, changedA], sessionStartedAt: start, selection: "before" }).origin, "session", "a change in this session wins over the selection");
  const none = assignRun({ runs: [before, legacy], sessionStartedAt: start });
  assert.deepEqual([none.run, none.origin, none.open.map(item => item.id)], [null, "none", ["before", "legacy"]]);
  assert.equal(assignRun({ runs: [before], sessionStartedAt: start, selection: "gone" }).dropSelection, true);
  assert.equal(assignRun({ runs: [before, doneInSession], sessionStartedAt: Date.parse("2026-10-26T09:00:00Z"), selection: "done" }).dropSelection, true, "a remembered run that is no longer open is dropped");
  assert.deepEqual(openRuns([doneInSession, legacy, before]).map(item => item.id), ["before", "legacy"]);
  assert.equal(stepSelection(openRuns([before, changedA, changedB]), "b", 1), "a");
  assert.equal(stepSelection(openRuns([before, changedA, changedB]), "b", -1), "before");
  assert.equal(stepSelection([], "x", 1), null);
} finally {
  created.close();
  approval.close();
}

// Follow-up SCN-006: for runs routed by the canonical writers, the companion reads the route like
// `modeSliceDecision` and draws the status card's path and marks (without its own CD+Tests mark),
// active and after completion; no compact or blocked route shows a structured gate.
const UR_TEXT = "# UR: Route fixture\n\n## Problem\nShow the path of each route.\n\n## Goal\nKeep the companion's bar equal to the status card.\n\n## Scope\nDisposable fixture only.\n\n"
  + "## AGDF Approval Summary (de; source=en)\n- Problem: Pfad je Route zeigen.\n- Ziel: Die Leiste des Begleiters gleicht der Statuskarte.\n- Umfang: Nur isolierter Test.\n";
function routedRun(route) {
  const target = fixture();
  const id = "fixture-a";
  try {
    writeFileSync(join(target.root, target.documentPath), UR_TEXT);
    writeFileSync(target.runPath, sealRunState(target.root, readFileSync(target.runPath, "utf8")));
    writeFileSync(join(target.root, ".agdf", "control", "artefacts", id, "BROWNFIELD_REVIEW.md"), "# Brownfield Review\n");
    const revision = () => parseCoreRunState(readFileSync(target.runPath, "utf8"), id).meta.revision_id;
    const step = values => {
      const result = recordRunStep(target.root, { runId: id, revisionId: revision(), ...values }, { policy: policyForRunContent, date: "2026-10-27" });
      assert.equal(result.outcome, "recorded", JSON.stringify(result));
    };
    step({ step: "ur", title: "Route fixture" });
    if (route) step({ step: "route", route, reason: `route fixture ${route}`, evidence: "companion parity test" });
    const presentation = prepareRunPresentation(target.root, { runId: id, gate: "UR", revisionId: revision() }, { evaluateGateCheck });
    assert.equal(presentation.outcome, "prepared", JSON.stringify(presentation));
    const approvedUr = approveRunGate(target.root, { runId: id, gate: "UR", revisionId: revision(), response: "Approval: UR", presentationId: presentation.presentation_id }, { evaluateGateCheck });
    assert.equal(approvedUr.outcome, "approved", JSON.stringify(approvedUr));
    return target;
  } catch (error) {
    target.close();
    throw error;
  }
}
const CARD_MARK = Object.freeze({ fulfilled: "done", current: "current", open: "open" });
const cardPath = root => evaluateGateCheck(root, { runId: "fixture-a" }).status_card.breadcrumb.map(({ gate, status }) => ({ gate, mark: CARD_MARK[status] }));
const companionPath = runState => gateMarks(runState).filter(({ gate }) => gate !== "CD+Tests");
for (const route of [null, "quick_task", "verified_change", "structured_slice", "structured_delivery", "block"]) {
  const target = routedRun(route);
  try {
    const name = route ?? "undecided";
    const result = parsed(target.root, "fixture-a");
    assert.equal(result.ok, true, `${name}: parses`);
    assert.equal(result.run.route, modeSliceDecision(readRunState(target.root, { runId: "fixture-a" })), `${name}: route parity`);
    assert.deepEqual(companionPath(result.run), cardPath(target.root), `${name}: path parity`);
    setScalar(target.root, "fixture-a", "lifecycle", "completed");
    setScalar(target.root, "fixture-a", "current_gate", "OR");
    const completed = parsed(target.root, "fixture-a").run;
    if (!["structured_slice", "structured_delivery"].includes(route)) {
      assert.ok(!gateMarks(completed).some(({ gate }) => ["PRD", "SD", "TP", "CD+Tests"].includes(gate)), `${name}: completed run shows no structured gate`);
    }
    assert.deepEqual(companionPath(completed).map(({ gate }) => gate), cardPath(target.root).map(({ gate }) => gate), `${name}: completed path parity`);
  } finally {
    target.close();
  }
}
// Format variants of the Mode/Slice Decision read like the core: backticks, a template value, a
// missing scope reason or evidence, and the spaced heading.
const variants = routedRun("quick_task");
try {
  const runPath = runFile(variants.root, "fixture-a");
  const original = readFileSync(runPath, "utf8");
  for (const [name, edit] of [
    ["backticked decision", text => text.replace(/^- decision: quick_task$/mu, "- decision: `quick_task`")],
    ["empty evidence", text => text.replace(/^(- evidence:).*$/mu, "$1")],
    ["template scope reason", text => text.replace(/^(- scope_reason:).*$/mu, "$1 `a | b`")],
    ["template decision", text => text.replace(/^- decision: quick_task$/mu, "- decision: `quick_task | verified_change | block`")],
    ["spaced heading", text => text.replace(/^## Mode\/Slice Decision$/mu, "## Mode / Slice Decision")],
  ]) {
    const edited = edit(original);
    assert.notEqual(edited, original, `${name}: the variant changes the run state`);
    writeFileSync(runPath, sealRunState(variants.root, edited));
    const variantRun = parsed(variants.root, "fixture-a").run;
    assert.equal(variantRun.route, modeSliceDecision(readRunState(variants.root, { runId: "fixture-a" })), `${name}: route parity`);
  }
} finally {
  variants.close();
}
// CR-F04: an Approvals status in backticks counts as approved, as the core reader strips them; the
// marks then still equal the status card.
const backticked = routedRun("structured_delivery");
try {
  const runPath = runFile(backticked.root, "fixture-a");
  const original = readFileSync(runPath, "utf8");
  const edited = original.replace(/^\| UR \| approved \|/mu, "| UR | `approved` |");
  assert.notEqual(edited, original, "the UR approval row is rewritten with backticks");
  writeFileSync(runPath, sealRunState(backticked.root, edited));
  const tickedRun = parsed(backticked.root, "fixture-a").run;
  const coreApproved = [...readRunState(backticked.root, { runId: "fixture-a" }).approvals.entries()].filter(([, row]) => row.status === "approved").map(([gate]) => gate);
  assert.deepEqual(tickedRun.approved, coreApproved, "backticked approval parity");
  assert.deepEqual(companionPath(tickedRun), cardPath(backticked.root), "backticked approval: path parity");
} finally {
  backticked.close();
}

// SCN-008: localization parity with the status-card lookup and the core chat-language rule.
const configRoot = mkdtempSync(join(tmpdir(), "agdf-companion-locale-"));
try {
  for (const config of [null, "{", JSON.stringify({ chat_language: "de" }), JSON.stringify({ chat_language: "de-AT" }), JSON.stringify({ chat_language: "fr" }), JSON.stringify({ chat_language: "not a tag" })]) {
    rmSync(join(configRoot, ".agdf"), { recursive: true, force: true });
    if (config !== null) { mkdirSync(join(configRoot, ".agdf", "control"), { recursive: true }); writeFileSync(join(configRoot, ".agdf", "control", "config.json"), config); }
    assert.equal(chatLocale(registry, config), resolveConfiguredChatLanguage(configRoot), `chat language parity for ${config}`);
  }
} finally {
  rmSync(configRoot, { recursive: true, force: true });
}
const fallback = registry.locales[registry.fallbackLocale];
const sources = [...Object.values(fallback.operationalValues ?? {}), ...Object.values(fallback.primary.actions ?? {}),
  ...Object.values(fallback.primary.afterApproval ?? {}), fallback.primary.quality, "A free text the status card does not know."].filter(Boolean);
for (const source of sources) {
  const localized = localizeNextStep(registry, "de", source);
  assert.equal(localized.isLocalized, isOperationalValueRenderable(source, { registry, requestedLocale: "de" }), `next-step parity: ${source}`);
  if (!localized.isLocalized) assert.equal(localized.text, source, "an unlocalized next step keeps its source text");
}
assert.equal(localizeNextStep(registry, "en", "Draft the UR.").text, "Draft the UR.");
assert.equal(localizeNextStep(registry, "de", "none").text, registry.locales.de.primary.none);
assert.deepEqual(Object.keys(labels.locales).sort(), Object.keys(registry.locales).sort(), "companion locale set equals the core registry");
assert.equal(labels.fallbackLocale, registry.fallbackLocale);
const leaves = (node, prefix = "") => Object.entries(node).flatMap(([key, value]) => (value && typeof value === "object" ? leaves(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]]));
const enLeaves = new Map(leaves(labels.locales.en));
for (const locale of Object.keys(labels.locales)) assert.deepEqual(leaves(labels.locales[locale]).map(([key]) => key).sort(), [...enLeaves.keys()].sort(), `label keys of ${locale}`);
assert.equal(label(labels, "de", "fields.position", { position: 2, count: 5 }), "2 von 5 offenen Runs");
assert.equal(label(labels, "de", "missing.key"), "missing.key");

// AC-005 / SCN-003: German views carry no English label; gate bar and fields per width.
const englishOnly = new Set([...enLeaves].filter(([key, value]) => new Map(leaves(labels.locales.de)).get(key) !== value).map(([, value]) => value));
const snapshot = runs => ({ status: "ok", runs, unreadable: [], readAt: Date.parse("2026-10-26T08:10:00Z") });
const viewOf = (runs, extra = {}) => buildPanelView({ snapshot: snapshot(runs), sessionStartedAt: Date.parse("2026-10-26T08:00:00Z"), selection: null,
  isTurnActive: false, registry, labels, locale: "de", columns: 40, ...extra });
const germanViews = [
  viewOf([run({ id: "w", missing: "Exact Approval: SD.", updatedAt: "2026-10-26T08:01:00Z" })]),
  viewOf([run({ id: "b", decision: "revise", updatedAt: "2026-10-26T08:01:00Z" })]),
  viewOf([run({ id: "f", lifecycle: "completed", updatedAt: "2026-10-26T08:01:00Z" })]),
  viewOf([run({ id: "l", updatedAt: "2026-10-26T08:01:00Z" })], { isTurnActive: true }),
  viewOf([run({ id: "o", updatedAt: "2026-10-26T07:00:00Z" })]),
  viewOf([]),
  buildPanelView({ snapshot: { status: "no_control", root: "C:\\Workspace\\voice-projekt", runs: [], unreadable: [], readAt: 1 }, registry, labels, locale: "de", columns: 40 }),
  buildPanelView({ snapshot: { status: "failed", runs: [], unreadable: [], readAt: 1 }, registry, labels, locale: "de", columns: 40 }),
  buildPanelView({ snapshot: { ...snapshot([]), unreadable: [{ id: "x", reason: "format" }] }, selection: "x", sessionStartedAt: 0, registry, labels, locale: "de", columns: 40 }),
];
assert.deepEqual(germanViews.map(view => view.stateLabel), ["wartet auf Freigabe", "blockiert", "fertig", "läuft", "bereit", "bereit", "bereit", "bereit", "bereit"]);
assert.equal(germanViews[1].reason, "Lösungsdesign: Überarbeitung nötig");
// A run-derived läuft names the next step; only a host-observed main-loop turn says that Claude is
// working (docs/architecture/07-ui-konzept.md: no "working" claim without observed activity).
const runningView = locale => buildPanelView({ snapshot: snapshot([run({ id: "r", updatedAt: "2026-10-26T08:01:00Z" })]),
  sessionStartedAt: Date.parse("2026-10-26T08:00:00Z"), selection: null, isTurnActive: false, registry, labels, locale, columns: 40 });
assert.deepEqual([runningView("de").stateLabel, runningView("de").reason, runningView("en").reason], ["läuft", "Als Nächstes: Lösungsdesign", "Next: Solution design"]);
assert.equal(germanViews[3].reason, "Claude arbeitet gerade an diesem Turn");
assert.equal(germanViews[4].message, "Kein Run zugeordnet");
assert.deepEqual([germanViews[5].message, germanViews[6].message, germanViews[6].hint],
  ["Keine offenen Runs in diesem Projekt.", "Kein AGDF-Kontrollordner in „voice-projekt“.", "Geprüfter Projektordner: C:\\Workspace\\voice-projekt"]);
// TPR-F02: the missing-control message names the checked folder in either path form; the terminal shows both lines.
const noControlView = root => buildPanelView({ snapshot: { status: "no_control", root, runs: [], unreadable: [], readAt: 1 }, registry, labels, locale: "en", columns: 40 });
assert.deepEqual([noControlView("/home/a/app/").message, noControlView("/home/a/app/").hint], ["No AGDF control folder in “app”.", "Checked project folder: /home/a/app/"]);
assert.ok(terminalText(germanViews[6], { labels, locale: "de" }).includes("Kein AGDF-Kontrollordner in „voice-projekt“.\nGeprüfter Projektordner: C:\\Workspace\\voice-projekt\n"));
assert.match(germanViews[7].message, /nicht lesbar: Kontrollordner/u);
assert.match(germanViews[8].message, /unbekanntes Format/u);
for (const view of germanViews) {
  for (const field of ["title", "stateLabel", "reason", "message", "hint", "origin", "openCount", "readAt", "stale"]) {
    if (view[field]) assert.equal(englishOnly.has(view[field]), false, `German panel shows English ${field}: ${view[field]}`);
  }
}
const assigned = germanViews[0];
assert.deepEqual([assigned.gateBar, assigned.origin, assigned.isObjectiveExpanded, Boolean(assigned.readAt)], ["✓UR ✓PRD ●SD ○TP ○CD+Tests ○QA ○UAT ○OR", "In dieser Sitzung geändert", false, true]);
for (const columns of [40, 60]) assert.ok(viewOf([run({ updatedAt: "2026-10-26T08:01:00Z" })], { columns }).gateBar.length <= columns, `gate bar fits ${columns} columns`);
const marks = gateMarks(run());
assert.equal(fullGateBar(marks).length, 39);
assert.deepEqual([gateBar(marks, 39), gateBar(marks, 38)], [fullGateBar(marks), "✓✓●○○○○○ SD"]);
assert.ok(!/\n/u.test(gateBar(marks, 10)), "the gate bar never wraps into two lines");

// Follow-up SCN-001: the build phase as `CD+Tests` between TP and QA on structured paths.
const structured = (gate, extra = {}) => run({ gate, approved: ["UR", "PRD", "SD", "TP"], ...extra });
for (const route of ["structured_delivery", "structured_slice"]) {
  for (const gate of BUILD_GATES) {
    assert.equal(fullGateBar(gateMarks(structured(gate, { route }))), "✓UR ✓PRD ✓SD ✓TP ●CD+Tests ○QA ○UAT ○OR", `${route} at ${gate}`);
  }
  assert.equal(fullGateBar(gateMarks(structured("TP", { route, approved: ["UR", "PRD", "SD"] }))), "✓UR ✓PRD ✓SD ●TP ○CD+Tests ○QA ○UAT ○OR");
  assert.equal(fullGateBar(gateMarks(structured("QA", { route }))), "✓UR ✓PRD ✓SD ✓TP ✓CD+Tests ●QA ○UAT ○OR");
  assert.equal(fullGateBar(gateMarks(structured("UAT", { route, approved: ["UR", "PRD", "SD", "TP", "QA"] }))), "✓UR ✓PRD ✓SD ✓TP ✓CD+Tests ✓QA ●UAT ○OR");
}
const completedStructured = gateMarks(structured("OR", { lifecycle: "completed", approved: ["UR", "PRD", "SD", "TP", "QA", "UAT"] }));
assert.equal(fullGateBar(completedStructured), "✓UR ✓PRD ✓SD ✓TP ✓CD+Tests ✓QA ✓UAT ✓OR");
const buildMarks = gateMarks(structured("CD+Tests"));
assert.ok(fullGateBar(buildMarks).length <= 40 && gateBar(buildMarks, 40) === fullGateBar(buildMarks), "the full structured bar fits 40 columns");
assert.equal(gateBar(buildMarks, 38), "✓✓✓✓●○○○ CD+Tests", "below its width the condensed form names the current mark");
// Follow-up SCN-006 (unit part): the other routes show the status card's path only.
const compact = (route, gate, extra = {}) => fullGateBar(gateMarks(run({ route, gate, approved: ["UR"], ...extra })));
assert.equal(compact("quick_task", "Quick Task Execution"), "✓UR ●Compact Delivery");
assert.equal(compact("quick_task", "OR", { lifecycle: "completed" }), "✓UR ✓Compact Delivery");
assert.equal(compact("verified_change", "Verified Change Execution"), "✓UR ●Verified Change ○OR");
assert.equal(compact("verified_change", "OR"), "✓UR ✓Verified Change ●OR");
assert.equal(compact("verified_change", "OR", { lifecycle: "completed" }), "✓UR ✓Verified Change ✓OR");
assert.equal(compact("block", "Mode/Slice Decision"), "✓UR ●Block");
assert.equal(compact("undecided", "UR", { approved: [] }), "●UR");
assert.equal(compact("undecided", "Brownfield Review"), "✓UR");
for (const route of ["mystery", "constructor", "toString"]) assert.equal(compact(route, "UR", { approved: [] }), "●UR", `unknown route ${route} reads as undecided`);
for (const route of ["quick_task", "verified_change", "block"]) {
  assert.ok(!/PRD|SD|TP|CD\+Tests/u.test(compact(route, "OR", { lifecycle: "completed", approved: ["UR", "PRD", "SD", "TP"] })), `${route} never shows structured gates`);
}

// Follow-up SCN-003: the build mood, its precedence and the turn overlay.
for (const gate of BUILD_GATES) assert.deepEqual(runState(structured(gate)), { mood: "baut", reason: { key: "building", gate } });
assert.equal(runState(structured("CR", { gateResult: "revise" })).mood, "blockiert", "blocked wins over building");
assert.equal(runState(structured("CD+Tests", { missing: "Exact Approval: QA." })).mood, "wartet", "waiting wins over building");
assert.equal(runState(structured("CD+Tests", { route: "quick_task" })).mood, "laeuft", "only structured runs build");
assert.equal(runState(structured("QA")).mood, "laeuft");
assert.deepEqual(displayState(structured("CD+Tests"), { isTurnActive: true }), { mood: "baut", reason: { key: "building", gate: "CD+Tests" } }, "a turn keeps the build state");
assert.deepEqual(displayState(structured("QA"), { isTurnActive: true }), { mood: "laeuft", reason: { key: "turnActive" } });
const buildView = locale => buildPanelView({ snapshot: snapshot([structured("CD+Tests", { id: "build", updatedAt: "2026-10-26T08:01:00Z" })]),
  sessionStartedAt: Date.parse("2026-10-26T08:00:00Z"), selection: null, isTurnActive: true, registry, labels, locale, columns: 40 });
assert.deepEqual([buildView("de").stateLabel, buildView("de").reason, buildView("en").stateLabel, buildView("en").reason],
  ["baut", "In Arbeit: Implementierung und Tests", "building", "In progress: Implementation and tests"]);
assert.ok(terminalText(buildView("de"), { labels, locale: "de" }).includes("(o_o) ⚒ baut · In Arbeit: Implementierung und Tests"));

// SCN-018: figure geometry, still pose and terminal text.
const disjoint = (a, b) => a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
assert.ok(disjoint(FIGURE_BOX, ACCESSORY_REGION), "accessory region lies outside the figure box");
for (const [mood, bounds] of Object.entries(ACCESSORY_BOUNDS)) {
  if (!bounds) continue;
  assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= ACCESSORY_REGION.width && bounds.y + bounds.height <= ACCESSORY_REGION.height, `${mood} accessory stays in its region`);
}
const wellFormed = svg => { const stack = []; for (const match of svg.matchAll(/<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/gu)) {
  const [, close, name, self] = match; if (self) continue; if (close) { if (stack.pop() !== name) return false; } else stack.push(name); } return stack.length === 0; };
for (const mood of ["laeuft", "baut", "wartet", "blockiert", "fertig", "neutral"]) {
  const moving = figureSvg(mood, { title: "AGDF <x> & \"y\"" });
  const still = figureSvg(mood, { still: true, title: "AGDF" });
  assert.ok(wellFormed(moving) && wellFormed(still), `${mood} SVG is well-formed`);
  assert.equal(/<animate|<set\b/u.test(still), false, `${mood} still pose has no animation`);
  assert.ok(moving.length < 131072, "Svg source stays below the host limit");
  assert.ok(moving.includes("AGDF &lt;x&gt; &amp; &quot;y&quot;"), "title is escaped");
  if (mood !== "neutral") assert.ok(/<animate/u.test(moving), `${mood} moves when not still`);
  assert.ok(FIGURE_TEXT[mood], `${mood} has a terminal face`);
}
const text = terminalText(assigned, { labels, locale: "de" });
for (const required of ["AGDF Companion", "wartet auf Freigabe", "✓UR ✓PRD ●SD", "Nächster Schritt: ", "Stand "]) assert.ok(text.includes(required), `terminal text carries ${required}`);

// Follow-up SCN-004: the hammer's swing and the bricks stay inside the declared bounds, which lie in
// the accessory region; the strokes add at most 0.75 px on each side.
const rotate = ({ x, y }, degrees) => {
  const angle = (degrees * Math.PI) / 180;
  return { x: HAMMER.pivot.x + x * Math.cos(angle) - y * Math.sin(angle), y: HAMMER.pivot.y + x * Math.sin(angle) + y * Math.cos(angle) };
};
const corners = ({ x, y, width, height }) => [[x, y], [x + width, y], [x, y + height], [x + width, y + height]].map(([cx, cy]) => ({ x: cx, y: cy }));
const inBounds = ({ x, y }, bounds) => x - 0.75 >= bounds.x && x + 0.75 <= bounds.x + bounds.width && y - 0.75 >= bounds.y && y + 0.75 <= bounds.y + bounds.height;
for (let degrees = HAMMER.swing[0]; degrees <= HAMMER.swing[1]; degrees += 0.5) {
  for (const corner of [...corners(HAMMER.head), ...corners(HAMMER.handle)]) assert.ok(inBounds(rotate(corner, degrees), ACCESSORY_BOUNDS.baut), `hammer at ${degrees}° stays in its bounds`);
}
for (const brick of BRICKS) for (const corner of corners({ ...brick, ...BRICK_SIZE })) assert.ok(inBounds(corner, ACCESSORY_BOUNDS.baut), "bricks stay in their bounds");
const building = figureSvg("baut");
const pivot = `${HAMMER.pivot.x} ${HAMMER.pivot.y}`;
assert.ok(building.includes(`values="${HAMMER.swing[1]} ${pivot};${HAMMER.swing[0]} ${pivot};${HAMMER.swing[1]} ${pivot}"`), "the drawn swing uses the tested angles");
assert.ok(figureSvg("baut", { still: true }).includes(`rotate(${HAMMER.swing[1]} ${pivot})`), "the still pose holds the raised hammer");
assert.equal(FIGURE_TEXT.baut, "(o_o) ⚒");

// Follow-up SCN-008: toasts only for transitions of the same run into or within wartet and blockiert.
const seen = (runId, state) => ({ kind: "run", runId, state });
const working = runState(run());
const waitingSd = runState(run({ missing: "Exact Approval: SD." }));
const waitingQa = runState(run({ gate: "QA", missing: "Exact Approval: QA." }));
const blockedRevise = runState(structured("CR", { gateResult: "revise" }));
const blockedBlock = runState(structured("CR", { gateResult: "block" }));
const steps = [];
let observation = null;
for (const [observed, name] of [[seen("a", waitingSd), "baseline"], [seen("a", waitingSd), "equal read"], [seen("a", working), "approved"],
  [seen("a", waitingQa), "waiting"], [seen("a", waitingQa), "equal read"], [{ kind: "unreadable" }, "unreadable"], [seen("a", waitingQa), "same after unreadable"],
  [seen("a", blockedRevise), "blocked"], [seen("a", blockedBlock), "decision changed"], [seen("b", waitingSd), "run switch"],
  [seen("b", runState(structured("CD+Tests"))), "building"], [seen("b", runState(run({ lifecycle: "completed" }))), "done"], [{ kind: "idle" }, "no run"],
  [seen("b", waitingSd), "baseline after no run"]]) {
  const result = observeNotice(observation, observed);
  observation = result.observation;
  steps.push([name, result.notice?.mood ?? null]);
}
assert.deepEqual(steps, [["baseline", null], ["equal read", null], ["approved", null], ["waiting", "wartet"], ["equal read", null], ["unreadable", null],
  ["same after unreadable", null], ["blocked", "blockiert"], ["decision changed", "blockiert"], ["run switch", null], ["building", null], ["done", null],
  ["no run", null], ["baseline after no run", null]]);
assert.equal(observeNotice(null, seen("a", waitingQa)).notice, null, "the first observation is a baseline");
assert.notEqual(observeNotice(observeNotice(null, seen("a", waitingSd)).observation, seen("a", waitingQa)).notice, null, "a new pending gate is announced");
// The observation is the run-derived state: the turn overlay never reaches it.
const overlaySnapshot = snapshot([run({ id: "o", missing: "Exact Approval: SD.", updatedAt: "2026-10-26T08:01:00Z" })]);
assert.deepEqual(observedRun({ snapshot: overlaySnapshot, sessionStartedAt: Date.parse("2026-10-26T08:00:00Z") }), seen("o", waitingSd));
assert.deepEqual(observedRun({ snapshot: { status: "failed", runs: [], unreadable: [], readAt: 1 }, sessionStartedAt: 0 }), { kind: "unreadable" });
assert.deepEqual(observedRun({ snapshot: { ...snapshot([]), unreadable: [{ id: "x", reason: "format" }] }, sessionStartedAt: 0, selection: "x" }), { kind: "unreadable" });
assert.deepEqual(observedRun({ snapshot: null, sessionStartedAt: 0 }), { kind: "idle" });
assert.deepEqual(observedRun({ snapshot: { status: "no_control", root: "/p", runs: [], unreadable: [], readAt: 1 }, sessionStartedAt: 0 }), { kind: "idle" });
assert.deepEqual(observedRun({ snapshot: snapshot([run({ id: "m", decision: "mystery", updatedAt: "2026-10-26T08:01:00Z" })]), sessionStartedAt: Date.parse("2026-10-26T08:00:00Z") }), { kind: "unreadable" });
assert.equal(noticeText("r1", waitingSd, { registry, labels, locale: "de" }), "r1 wartet auf Freigabe: Lösungsdesign");
assert.equal(noticeText("r1", blockedRevise, { registry, labels, locale: "de" }), "r1 ist blockiert: Code-Review – Überarbeitung nötig");
assert.equal(noticeText("r1", runState(run({ decision: "awaiting_uat", gate: "UAT" })), { registry, labels, locale: "de" }), "r1 wartet auf Entscheidung: Nutzerabnahme");
assert.equal(noticeText("r1", waitingQa, { registry, labels, locale: "en" }), "r1 is waiting for approval: Quality assurance");
assert.equal(noticeText("r1", blockedBlock, { registry, labels, locale: "en" }), "r1 is blocked: Code review – blocked");

// Follow-up SCN-013: status-line texts per state and locale.
const status = (observed, locale = "de") => statusText(observed, { labels, locale });
assert.deepEqual([status(seen("a", waitingQa)), status(seen("a", runState(structured("CR")))), status(seen("a", working)), status(seen("a", blockedRevise)),
  status(seen("a", runState(run({ lifecycle: "completed" })))), status({ kind: "idle" }), status({ kind: "unreadable" })],
["AGDF · QA · wartet", "AGDF · CR · baut", "AGDF · SD · läuft", "AGDF · CR · blockiert", "AGDF · fertig", "AGDF · bereit", "AGDF · nicht lesbar"]);
assert.deepEqual([status(seen("a", waitingQa), "en"), status({ kind: "idle" }, "en"), status({ kind: "unreadable" }, "en")], ["AGDF · QA · waiting", "AGDF · idle", "AGDF · unreadable"]);

// Follow-up SCN-011 (logic part): the generated chime is a short 8 kHz, 8-bit mono WAV.
const clip = chimeClip();
const wav = Buffer.from(clip.base64, "base64");
assert.equal(clip.mime, "audio/wav");
assert.equal(chimeClip(), clip, "the chime is generated once");
assert.deepEqual([wav.toString("ascii", 0, 4), wav.toString("ascii", 8, 12), wav.toString("ascii", 12, 16), wav.toString("ascii", 36, 40)], ["RIFF", "WAVE", "fmt ", "data"]);
assert.deepEqual([wav.readUInt16LE(20), wav.readUInt16LE(22), wav.readUInt32LE(24), wav.readUInt16LE(34)], [1, 1, CHIME.rate, 8], "PCM, mono, 8 kHz, 8 bit");
assert.equal(wav.readUInt32LE(40), wav.length - 44);
assert.equal(wav.readUInt32LE(4), wav.length - 8);
assert.ok(Math.abs((wav.length - 44) / CHIME.rate - 0.3) < 0.001, "about 0.3 s");
assert.equal(Buffer.from(wav).toString("base64"), clip.base64, "the module's encoder equals standard base64");
assert.equal(CHIME.gain, 0.35);

// Follow-up SCN-018: one brand name in every locale; the command name is unchanged.
for (const [locale, pack] of Object.entries(labels.locales)) {
  assert.equal(pack.title, "AGDF Companion", `${locale} title`);
  for (const key of ["description", "enabled", "disabled", "waiting"]) assert.ok(pack.command[key].includes("AGDF Companion"), `${locale} command.${key} names the brand`);
}
assert.ok(!/Begleiter|companion\b/u.test(JSON.stringify(labels)), "no other brand spelling in the companion's texts");

// Follow-up SCN-020: the placeholder rule equals the core's; a template objective is not shown.
for (const value of ["Describe the trustworthy outcome.", "  describe   the TRUSTWORTHY outcome. ", "`TBD`", "todo", "<goal>", "draft | done", "pass | revise | block",
  "What outcome should become possible?", "", "   ", "done", "Show the run state.", "A user who has switched the AGDF Companion on sees the build phase.", undefined]) {
  assert.equal(isPlaceholderText(value), isDecisionContentPlaceholder(value), `placeholder parity for ${JSON.stringify(value)}`);
}
const freshTarget = fixture();
const freshRoot = freshTarget.root;
try {
  createRun(freshRoot, "fresh-run");
  assert.match(readFileSync(runFile(freshRoot, "fresh-run"), "utf8"), /Describe the trustworthy outcome\./u, "the canonical template objective");
  const fresh = parsed(freshRoot, "fresh-run");
  assert.equal(fresh.run.objective, "");
  const freshView = buildPanelView({ snapshot: snapshot([{ ...fresh.run, updatedAt: "2026-10-26T08:01:00.000Z" }]), sessionStartedAt: Date.parse("2026-10-26T08:00:00Z"),
    selection: null, isTurnActive: false, registry, labels, locale: "de", columns: 40 });
  assert.ok(!freshView.objective && !terminalText(freshView, { labels, locale: "de" }).includes("Ziel:"), "no objective line for a template objective");
} finally {
  freshTarget.close();
}

// Follow-up SCN-021 (logic part): Claude's language setting chooses the locale only without AGDF
// config: a supported tag or a language name, else the fallback.
for (const [setting, expected] of [["de", "de"], ["de-AT", "de"], ["German", "de"], ["deutsch", "de"], [" Deutsch ", "de"], ["English", "en"], ["en-GB", "en"],
  ["japanese", "en"], ["fr", "en"], ["", "en"], [null, "en"], [42, "en"]]) {
  assert.equal(chatLocale(registry, null, { setting, labels }), expected, `setting ${JSON.stringify(setting)}`);
}
assert.equal(settingLocale(registry, labels, "Klingon"), null);
assert.equal(chatLocale(registry, JSON.stringify({ chat_language: "en" }), { setting: "de", labels }), "en", "an AGDF config wins over the setting");

// SDD-07: persistence location and format.
const configDir = join(tmpdir(), "claude-config");
assert.equal(pluginDataDir({ configDir }).replaceAll("\\", "/"), claudePluginDataRoot({ claudeConfigDir: configDir }).replaceAll("\\", "/"));
assert.equal(pluginDataDir({ userProfile: "C:/Users/a" }), "C:/Users/a/.claude/plugins/data/agdf-agdf");
assert.equal(pluginDataDir({ home: "/home/a" }), "/home/a/.claude/plugins/data/agdf-agdf");
assert.equal(pluginDataDir({}), null);
assert.equal(STATE_FILE, "companion-state.json");
assert.deepEqual(parseCompanionState(serializeCompanionState({ enabled: true, still: false, notice: false, sound: true, selections: { "/p": "run-1" } })),
  { enabled: true, still: false, notice: false, sound: true, selections: { "/p": "run-1" } });
// Follow-up SCN-011: a state file of the first companion version reads with toasts on and sound off.
assert.deepEqual(parseCompanionState("{\"schema_version\":1,\"enabled\":true,\"still\":true,\"selections\":{\"/p\":\"run-1\"}}"),
  { enabled: true, still: true, notice: true, sound: false, selections: { "/p": "run-1" } });
assert.deepEqual(parseCompanionState("{\"schema_version\":1,\"notice\":\"no\",\"sound\":1}"), { enabled: false, still: false, notice: true, sound: false, selections: {} });
for (const invalid of ["", "[]", "{\"schema_version\":2,\"enabled\":true}", "{\"schema_version\":1,\"enabled\":\"yes\",\"selections\":{\"/p\":\"../x\"}}"]) {
  const parsedState = parseCompanionState(invalid);
  assert.deepEqual(parsedState, { enabled: false, still: false, notice: true, sound: false, selections: {} }, `invalid state ${invalid}`);
  // CR-F03: the defaults must accept a selection; a frozen object would silently drop it.
  parsedState.selections["/p"] = "run-1";
  assert.equal(parsedState.selections["/p"], "run-1", `defaults for ${invalid} are mutable`);
}

// Chat-run navigation SCN-001 (run agdf-companion-chat-run-navigation-20261028-01): a run counts as named
// only as a whole token; the last one named wins; a long text is read from its end.
{
  const ids = ["run-a", "run-b", "run-a-extra"];
  assert.equal(namedRun("work on run-a now", ids), "run-a");
  assert.equal(namedRun("run-a then run-b", ids), "run-b");
  assert.equal(namedRun("run-b then run-a", ids), "run-a");
  assert.equal(namedRun("run-a-extra is next", ids), "run-a-extra", "the longer id wins its own token");
  assert.equal(namedRun("run-a-extra is next", ["run-a"]), null, "an id inside a longer id does not count");
  assert.equal(namedRun("xrun-a and run-ab", ["run-a"]), null);
  assert.equal(namedRun("Weiter mit run-a.", ["run-a"]), "run-a", "a sentence may end with a run id");
  assert.equal(namedRun("see run-a.md", ["run-a"]), null, "a dot followed by an id character continues the token");
  assert.equal(namedRun("Ausgewählter Run · `run-b` and .agdf/control/runs/run-a/RUN_STATE.md", ["run-a", "run-b"]), "run-a");
  assert.equal(namedRun("run_a run.a", ["run"]), null, "underscore and dot belong to ids");
  for (const text of [42, null, undefined, "", "nothing here"]) assert.equal(namedRun(text, ids), null, String(text));
  assert.equal(namedRun(`run-a ${"x ".repeat(40_000)}`, ids), null, "a mention beyond the scanned end is not read");
  assert.equal(namedRun(`run-a ${"x ".repeat(40_000)} run-b`, ids), "run-b");
  // Code Review CR-F08: a window that starts inside a longer id does not turn its tail into a mention.
  const cut = `pre-run-a ${"x".repeat(65_536 - 6)}`;
  assert.equal(cut.length - 65_536, 4, "the window starts at run-a");
  assert.equal(namedRun(cut, ["run-a"]), null);
  assert.equal(namedRun(`pre run-a ${"x".repeat(65_536 - 6)}`, ["run-a"]), "run-a");
}

// Chat-run navigation SCN-004: the chat's run is the later of the mention and the newest change in the
// session; browsing shows the remembered selection; without a mention the rule is unchanged.
{
  const start = Date.parse("2026-10-28T08:00:00.000Z");
  const at = iso => Date.parse(iso);
  const runs = [
    run({ id: "named", updatedAt: "2026-10-28T07:00:00.000Z" }),
    run({ id: "changed", updatedAt: "2026-10-28T08:05:00.000Z" }),
    run({ id: "picked", updatedAt: "2026-10-28T07:30:00.000Z" }),
    run({ id: "done", lifecycle: "completed", updatedAt: "2026-10-28T07:10:00.000Z" }),
  ];
  const pick = (input) => { const result = assignRun({ runs, sessionStartedAt: start, ...input }); return [result.run?.id ?? null, result.origin, result.chatRunId]; };
  assert.deepEqual(pick({ mention: { runId: "named", at: at("2026-10-28T08:10:00Z") } }), ["named", "named", "named"], "a later mention wins");
  assert.deepEqual(pick({ mention: { runId: "named", at: at("2026-10-28T08:01:00Z") } }), ["changed", "session", "changed"], "a later change wins");
  assert.deepEqual(pick({ mention: { runId: "named", at: at("2026-10-28T08:05:00Z") } }), ["named", "named", "named"], "a mention at the same time wins");
  assert.deepEqual(pick({ mention: { runId: "done", at: at("2026-10-28T08:10:00Z") } }), ["changed", "session", "changed"], "a completed run is never named");
  assert.deepEqual(pick({ selection: "picked" }), ["changed", "session", "changed"], "without browsing the chat's run beats the selection");
  assert.deepEqual(pick({ selection: "picked", isBrowsing: true }), ["picked", "selected", "changed"], "browsing shows the selection");
  assert.deepEqual(pick({ selection: "gone", isBrowsing: true }), ["changed", "session", "changed"], "browsing without a valid selection keeps the chat's run");
  const quiet = runs.filter(item => item.id !== "changed");
  assert.deepEqual([assignRun({ runs: quiet, sessionStartedAt: start, selection: "picked" }).origin, assignRun({ runs: quiet, sessionStartedAt: start, selection: "picked" }).chatRunId], ["selected", null], "no chat run: the selection as today");
  assert.deepEqual(assignRun({ runs: quiet, sessionStartedAt: start, mention: { runId: "named", at: start }, selection: "picked", isBrowsing: true }).chatRunId, "named");
}

console.log("Claude companion logic tests passed");
