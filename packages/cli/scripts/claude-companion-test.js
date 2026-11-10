import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { deriveFigureState } from "../../core/lib/companion/figure-state.js";
import { claudePluginDataRoot } from "../lib/mcp-lifecycle/plugin-runtime.js";
import { resolveConfiguredChatLanguage } from "../../core/lib/resources/context.js";

// The Claude companion's logic (companion core T-006, SD SDD-010): the run view reader and its
// process boundary, the turn overlay, assignment, localization from the central catalog, gate bar,
// views, figure, notices, status line, persistence and chat-run navigation. Run semantics come from
// the Core run view; its entries here carry the Core-derived figure, as the run-view command emits.
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const companionDir = join(repoRoot, "plugins", "agdf", "host-templates", "claude", "companion");
const companion = name => import(pathToFileURL(join(companionDir, name)).href);
const { BUILD_GATES, READ_FAILURE_REASONS, RUN_VIEW_TIMEOUT_MS, companionRun, isStructured, readSnapshot, runViewArgv, settleSnapshot, snapshotFromRunView } = await companion("run-state.mjs");
const { displayState, runState, MOODS } = await companion("state.mjs");
const { assignRun, namedRun, openRuns, stepSelection } = await companion("assignment.mjs");
const { chatLocale, companionLabels, label, settingLocale } = await companion("localization.mjs");
const { condensedGateBar, fullGateBar, gateBar, gateMarks } = await companion("gate-bar.mjs");
const { FIGURE_TEXT, figureSvg, observeFigure } = await companion("figure.mjs");
const { CHIME, chimeClip, noticeText, observeNotice, observedRun, statusText } = await companion("notice.mjs");
const { buildPanelView, terminalText } = await companion("view.mjs");
const { STATE_FILE, parseCompanionState, pluginDataDir, serializeCompanionState } = await companion("persistence.mjs");
const registry = JSON.parse(readFileSync(join(repoRoot, "plugins", "agdf", "meta", "agdf-interaction-locales.json"), "utf8"));
const labels = companionLabels(registry);

// A run-view entry as the command emits it, and the companion's run of it with the Core figure.
const PATH = ["UR", "PRD", "SD", "TP", "QA", "UAT", "OR"];
const path = (current, { done = PATH.indexOf(current) } = {}) => PATH.map((gate, at) => ({ gate, status: at < done ? "fulfilled" : gate === current ? "current" : "open" }));
const entry = (overrides = {}) => ({ run_id: "r", title: "Show the run state.", lifecycle: "active", valid: true, evaluated: true, status: "open",
  current_gate: "SD", mode: "structured_delivery", last_activity: "2026-10-26T08:00:00.000Z", missing_approval: "none", blocking_reason: "none",
  blocking_text: "keine", next_step: "Draft the SD.", next_step_text: "Das SD entwerfen.", user_action_required: "no", path: path("SD"), ...overrides });
const run = (overrides = {}) => { const value = entry({ completion_confirmed: overrides.lifecycle === 'completed', ...overrides }); return companionRun({ ...value, figure: deriveFigureState(value) }); };
const structured = (gate, overrides = {}) => run({ current_gate: gate, path: path("QA", { done: 4 }).map(row => row.gate === "QA" ? { ...row, status: "open" } : row), ...overrides });
const snapshot = (runs, extra = {}) => ({ status: "ok", runs, unreadable: [], readAt: Date.parse("2026-10-26T08:10:00Z"), ...extra });
const view = (input, locale = "de") => buildPanelView({ sessionStartedAt: Date.parse("2026-10-26T08:00:00Z"), selection: null, isTurnActive: false,
  registry, labels, locale, columns: 60, ...input });

// SCN-022 / SDD-010: the only process call is the read-only run view; failures never become a self-derived state.
{
  const runView = (runs, store = { status: "ok", reason: null }, diagnosis = { unreadable: [], counts: { unreadable: 0 } }) =>
    JSON.stringify({ schema_version: "run-view/1", root: "C:/p", language: "de", store, counts: null, diagnosis, runs, authorizes: false });
  const calls = [];
  const processes = results => ({ run: async (argv, init) => { calls.push({ argv, init }); const next = results.shift(); if (next instanceof Error) throw next; return next; } });
  const argv = runViewArgv({ pluginRoot: "C:/plugin", root: "C:/p", language: "de", runIds: ["picked"] });
  assert.deepEqual(argv, ["node", "C:/plugin/runtime/agdf-local.js", "run-view", "--dir", "C:/p", "--json", "--language", "de", "--run", "picked"]);
  const ok = await readSnapshot(processes([{ exitCode: 0, stdout: runView([{ ...entry(), figure: deriveFigureState(entry()) },
    { run_id: "legacy", valid: false, evaluated: true, findings: ["AGDF_RUN_VERSION_UNSUPPORTED"] }], undefined,
    { unreadable: [{ run_id: "legacy", reason: "run_version_unsupported" }], counts: { unreadable: 1 } }), stderr: "" }]),
    { pluginRoot: "C:/plugin", root: "C:/p", language: "de", runIds: ["picked"], now: 5 });
  assert.deepEqual(calls.at(-1), { argv, init: { timeoutMs: RUN_VIEW_TIMEOUT_MS } });
  assert.equal(RUN_VIEW_TIMEOUT_MS, 10_000);
  assert.deepEqual([ok.status, ok.runs.map(item => item.id), ok.unreadable, ok.readAt], ["ok", ["r"], [{ id: "legacy", reason: "run_version_unsupported" }], 5]);
  assert.equal(ok.runs[0].figure.mood, "laeuft", "the figure comes from the run view");
  // The host clock as $.clock.now() gives it: one reading before and one after the call.
  const clockOf = elapsed => { const readings = [100, 100 + elapsed]; return async () => readings.shift(); };
  const read = (result, elapsed = 0) => readSnapshot(processes([result]), { pluginRoot: "C:/plugin", root: "C:/p", language: "en", now: 9, clock: clockOf(elapsed) });
  assert.deepEqual([(await read({ exitCode: 2, stdout: runView([], { status: "no_control", reason: null }) })).status], ["no_control"]);
  const layout = await read({ exitCode: 2, stdout: runView([], { status: "unavailable", reason: "control_layout_unsupported" }) });
  assert.deepEqual([layout.status, layout.reason, layout.runFolders], ["unavailable", "control_layout_unsupported", null]);
  // AC-002 (T-004, T-013 finding F2): the run folders of an unsupported store are carried, a missing or
  // non-positive count is none.
  for (const [runFolders, expected] of [[189, 189], [0, null], ["189", null], [-1, null]]) {
    const counted = await read({ exitCode: 2, stdout: runView([], { status: "unavailable", reason: "control_layout_unsupported", run_folders: runFolders }) });
    assert.equal(counted.runFolders, expected, `run_folders ${JSON.stringify(runFolders)}`);
  }
  // CR finding CIR-06: a rejection is a timeout only after the whole budget elapsed, whatever its text says.
  const shown = { exit: "Run-Ansicht-Befehl endete mit einem Fehler", timeout: "Lesen des Kontrollordners dauerte zu lange",
    unavailable: "Run-Ansicht konnte nicht abgerufen werden", malformed: "Run-Ansicht lieferte ein unerwartetes Ergebnis",
    source_changed: "Kontrollordner hat sich beim Lesen geändert" };
  for (const [result, error, elapsed] of [[{ exitCode: 1, stdout: "", stderr: "usage" }, "exit"], [new Error("process killed"), "timeout", RUN_VIEW_TIMEOUT_MS],
    [new Error("spawn node ENOENT"), "unavailable"], [new Error("runtime/agdf-local.js could not start"), "unavailable", 40],
    [new Error("process timed out"), "unavailable", RUN_VIEW_TIMEOUT_MS - 1], [{ exitCode: 0, stdout: "{not json", stderr: "" }, "malformed"],
    [{ exitCode: 0, stdout: JSON.stringify({ schema_version: "run-view/2", runs: [], store: {} }), stderr: "" }, "malformed"],
    // CR delta review RV-1: a write during the read or the read budget is transient and keeps the last good view.
    [{ exitCode: 2, stdout: runView([], { status: "unavailable", reason: "source_changed" }), stderr: "" }, "source_changed"],
    [{ exitCode: 2, stdout: runView([], { status: "unavailable", reason: "timeout" }), stderr: "" }, "timeout"],
    [{ exitCode: 0, stdout: runView([{ ...entry(), evaluated: false, evaluation_error: "source_changed", figure: { mood: "blockiert", reason: { key: "unreadable", reason: "source_changed" } } }]), stderr: "" }, "source_changed"]]) {
    const failed = await read(result, elapsed);
    assert.deepEqual([failed.status, failed.error, failed.runs.length], ["failed", error, 0], `failure ${error}`);
    const kept = settleSnapshot(ok, failed);
    assert.deepEqual([kept.status, kept.runs.length, kept.stale.error], ["ok", 1, error], `the last good view stays, marked stale (${error})`);
    const without = view({ snapshot: settleSnapshot(null, failed) });
    assert.deepEqual([without.mood, without.message, without.runId], ["bereit", `Run-Ansicht nicht verfügbar: ${shown[error]}`, undefined],
      `without any view the companion names the failure and its reason (${error})`);
  }
  assert.deepEqual(Object.keys(shown).sort(), [...READ_FAILURE_REASONS].sort(), "every read failure reason is shown");
  const unknown = view({ snapshot: settleSnapshot(null, { status: "failed", runs: [], unreadable: [], readAt: 1, error: "spawn EACCES C:\\secret" }) });
  assert.equal(unknown.message, `Run-Ansicht nicht verfügbar: ${shown.unavailable}`, "an unknown failure text is never shown raw");
  assert.equal(snapshotFromRunView(runView([{ ...entry({ run_id: "x" }), figure: deriveFigureState(entry()) }]), { now: 1 }).runs[0].nextText, "Das SD entwerfen.");
}

// The turn overlay: a main-loop turn shows läuft, except that waiting and building runs keep their mood.
{
  const waiting = run({ missing_approval: "Approval: SD" });
  assert.deepEqual(displayState(waiting, { isTurnActive: true }), { mood: "wartet", reason: { key: "waitingApproval", gate: "SD" } });
  assert.deepEqual(displayState(run({ user_action_required: "yes" }), { isTurnActive: true }), { mood: "wartet", reason: { key: "waitingDecision", gate: "SD" } });
  for (const overrides of [{ status: "blocked", blocking_reason: "AGDF_SD_DECISIONS_OPEN" }, {}, { lifecycle: "completed" }]) {
    assert.deepEqual(displayState(run(overrides), { isTurnActive: true }), { mood: "laeuft", reason: { key: "turnActive" } }, JSON.stringify(overrides));
  }
  assert.deepEqual(displayState(waiting), { mood: "wartet", reason: { key: "waitingApproval", gate: "SD" } });
  assert.deepEqual(runState(null), { mood: "bereit", reason: { key: "idle" } });
  assert.deepEqual(MOODS, ["laeuft", "baut", "wartet", "blockiert", "fertig", "bereit"]);
  for (const gate of BUILD_GATES) assert.deepEqual(displayState(structured(gate), { isTurnActive: true }), { mood: "baut", reason: { key: "building", gate } });
}

// SCN-007: assignment per session.
{
  const start = Date.parse("2026-10-26T08:00:00.000Z");
  const before = run({ run_id: "before", last_activity: "2026-10-26T07:59:59.000Z" });
  const changedA = run({ run_id: "a", last_activity: "2026-10-26T08:00:00.000Z" });
  const changedB = run({ run_id: "b", last_activity: "2026-10-26T08:05:00.000Z" });
  const legacy = run({ run_id: "legacy", last_activity: null });
  const doneInSession = run({ run_id: "done", lifecycle: "completed", last_activity: "2026-10-26T08:06:00.000Z" });
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
}

// SCN-017 / SD SDD-004: every text comes from the catalog's companion section; no locale file of its own.
assert.equal(existsSync(join(companionDir, "locales.json")), false, "the companion keeps no text file of its own");
assert.equal(existsSync(join(companionDir, "core.mjs")), false, "the companion keeps no Core bridge");
assert.deepEqual(Object.keys(labels.locales).sort(), Object.keys(registry.locales).sort());
assert.equal(labels.fallbackLocale, registry.fallbackLocale);
assert.equal(label(labels, "de", "fields.position", { position: 2, count: 5 }), "2 von 5 offenen Runs");
assert.equal(label(labels, "de", "missing.key"), "missing.key");
{
  const used = new Set();
  for (const name of readdirSync(companionDir).filter(file => file.endsWith(".mjs"))) {
    const source = readFileSync(join(companionDir, name), "utf8");
    for (const match of source.matchAll(/\bt\(\s*['"]([A-Za-z]+(?:\.[A-Za-z]+)+)['"]/gu)) used.add(match[1]);
    assert.doesNotMatch(source, /^\s*import\s[^;]*from\s*['"](?!\.\/)/mu, `${name} imports only companion modules`);
  }
  assert.ok(used.size > 20, "the companion's static label keys are found");
  for (const key of used) for (const locale of ["de", "en"]) {
    assert.notEqual(label(labels, locale, key), key, `${locale} catalog copy for ${key}`);
  }
}

// AC-005 / SCN-003: German views from the run view; gate bar and fields per width.
{
  const at = "2026-10-26T08:01:00Z";
  const waiting = view({ snapshot: snapshot([run({ missing_approval: "Approval: SD", last_activity: at })]) });
  assert.deepEqual([waiting.stateLabel, waiting.reason, waiting.nextStep, waiting.gateBar], ["wartet auf Freigabe", "Freigabe ausstehend: Lösungsdesign", "Das SD entwerfen.",
    "✓UR ✓PRD ●SD ○TP ○CD+Tests ○QA ○UAT ○OR"]);
  const blocked = view({ snapshot: snapshot([run({ status: "blocked", blocking_reason: "AGDF_RUN_SEAL_MISMATCH", blocking_text: "Siegel verletzt", last_activity: at })]) });
  assert.deepEqual([blocked.stateLabel, blocked.reason], ["blockiert", "Lösungsdesign: Siegel verletzt"], "the status card's blocking text, also for doctor blocks");
  const working = view({ snapshot: snapshot([run({ last_activity: at })]) });
  assert.deepEqual([working.stateLabel, working.reason, view({ snapshot: snapshot([run({ last_activity: at })]) }, "en").reason], ["läuft", "Als Nächstes: Lösungsdesign", "Next: Solution design"]);
  assert.equal(view({ snapshot: snapshot([run({ last_activity: at })]), isTurnActive: true }).reason, "Claude arbeitet gerade an diesem Turn");
  const building = view({ snapshot: snapshot([structured("CD+Tests", { last_activity: at })]) });
  assert.deepEqual([building.stateLabel, building.reason], ["baut", "In Arbeit: Implementierung und Tests"]);
  assert.ok(terminalText(building, { labels, locale: "de" }).includes("(o_o) ⚒ baut · In Arbeit: Implementierung und Tests"));
  const done = view({ snapshot: snapshot([run({ lifecycle: "completed", status: "pass", current_gate: "OR", last_activity: at })]) });
  assert.deepEqual([done.stateLabel, done.nextStep], ["fertig", null]);
  assert.equal(view({ snapshot: snapshot([run({ run_id: "old", last_activity: "2026-10-26T07:00:00Z" })]) }).message, "Kein Run zugeordnet");
  assert.equal(view({ snapshot: snapshot([]) }).message, "Keine offenen Runs in diesem Projekt.");
  const noControl = view({ snapshot: { status: "no_control", root: "C:\\Workspace\\voice-projekt", runs: [], unreadable: [], readAt: 1 } });
  assert.deepEqual([noControl.message, noControl.hint], ["Kein AGDF-Kontrollordner in „voice-projekt“.", "Geprüfter Projektordner: C:\\Workspace\\voice-projekt"]);
  const layout = view({ snapshot: { status: "unavailable", reason: "control_layout_unsupported", runs: [], unreadable: [], readAt: 1 } });
  assert.equal(layout.message, "Run-Status nicht lesbar: Aufbau des Kontrollordners nicht unterstützt");
  // AC-002 (T-004): with counted run folders the unsupported store names count and reason, never "Keine offenen Runs".
  const counted = view({ snapshot: { status: "unavailable", reason: "control_layout_unsupported", runFolders: 189, runs: [], unreadable: [], readAt: 1 } });
  assert.equal(counted.message, "189 Runs nicht lesbar: Aufbau des Kontrollordners nicht unterstützt");
  assert.equal(view({ snapshot: { status: "unavailable", reason: "control_layout_unsupported", runFolders: 189, runs: [], unreadable: [], readAt: 1 } }, "en").message,
    "189 runs not readable: control folder layout not supported");
  // AC-002 / AC-003: unreadable runs are named with count and reason, beside the readable ones.
  const legacyOnly = view({ snapshot: snapshot([], { unreadable: [{ id: "legacy", reason: "run_version_unsupported" }] }) });
  assert.equal(legacyOnly.message, "1 Runs nicht lesbar: Run in einem älteren Format erfasst");
  const mixed = view({ snapshot: snapshot([run({ missing_approval: "Approval: SD", last_activity: at })], { unreadable: [{ id: "legacy", reason: "run_version_unsupported" }] }) });
  assert.deepEqual([mixed.stateLabel, mixed.unreadableHint], ["wartet auf Freigabe", "1 Runs nicht lesbar: Run in einem älteren Format erfasst"]);
  assert.ok(terminalText(mixed, { labels, locale: "de" }).includes("1 Runs nicht lesbar"));
  for (const item of [waiting, blocked, working, building, done, legacyOnly, mixed]) {
    for (const english of ["waiting", "blocked", "Next step", "Approval pending"]) assert.ok(!JSON.stringify(item).includes(english), `German view carries no ${english}`);
  }
  // Every text field of the German views is free of the companion catalog's English-only copy, and both
  // locales carry the same keys (the check main had, CR finding C6).
  const leaves = (value, prefix = "") => Object.entries(value ?? {}).flatMap(([key, item]) => (item && typeof item === "object"
    ? leaves(item, `${prefix}${key}.`) : [[`${prefix}${key}`, item]]));
  const enLeaves = new Map(leaves(labels.locales.en)), deLeaves = new Map(leaves(labels.locales.de));
  assert.deepEqual([...deLeaves.keys()].sort(), [...enLeaves.keys()].sort(), "German and English companion keys agree");
  const englishOnly = new Set([...enLeaves].filter(([key, value]) => deLeaves.get(key) !== value).map(([, value]) => value));
  assert.ok(englishOnly.size > 50, "the English-only copy is found");
  const fields = ["title", "stateLabel", "reason", "message", "hint", "unreadableHint", "origin", "openCount", "nextStep", "readAt", "stale", "eventsHint"];
  let compared = 0;
  for (const item of [waiting, blocked, working, building, done, noControl, layout, legacyOnly, mixed]) {
    for (const field of fields) {
      if (typeof item[field] !== "string") continue;
      compared += 1;
      assert.equal(englishOnly.has(item[field]), false, `German panel shows English ${field}: ${item[field]}`);
    }
  }
  assert.ok(compared >= 25, "the German view fields are compared");
  for (const columns of [40, 60]) assert.ok(view({ snapshot: snapshot([run({ last_activity: at })]), columns }).gateBar.length <= columns, `gate bar fits ${columns}`);
}

// Follow-up SCN-001 / SCN-006: the gate bar draws the status card's path and adds the build phase on structured paths.
{
  const marks = gateMarks(run());
  assert.equal(fullGateBar(marks), "✓UR ✓PRD ●SD ○TP ○CD+Tests ○QA ○UAT ○OR");
  assert.deepEqual([gateBar(marks, 40), gateBar(marks, 38)], [fullGateBar(marks), "✓✓●○○○○○ SD"]);
  assert.ok(!/\n/u.test(gateBar(marks, 10)), "the gate bar never wraps into two lines");
  assert.equal(fullGateBar(gateMarks(structured("CD+Tests"))), "✓UR ✓PRD ✓SD ✓TP ●CD+Tests ○QA ○UAT ○OR");
  assert.equal(gateBar(gateMarks(structured("CD+Tests")), 38), "✓✓✓✓●○○○ CD+Tests", "below its width the condensed form names the current mark");
  const completed = run({ lifecycle: "completed", current_gate: "OR", path: PATH.map(gate => ({ gate, status: "fulfilled" })) });
  assert.equal(fullGateBar(gateMarks(completed)), "✓UR ✓PRD ✓SD ✓TP ✓CD+Tests ✓QA ✓UAT ✓OR");
  const compact = (route, rows) => fullGateBar(gateMarks(run({ mode: route, path: rows })));
  assert.equal(compact("quick_task", [{ gate: "UR", status: "fulfilled" }, { gate: "Compact Delivery", status: "current" }]), "✓UR ●Compact Delivery");
  assert.equal(compact("verified_change", [{ gate: "UR", status: "fulfilled" }, { gate: "Verified Change", status: "fulfilled" }, { gate: "OR", status: "blocked" }]), "✓UR ✓Verified Change ●OR");
  assert.equal(compact("undecided", [{ gate: "UR", status: "current" }]), "●UR");
  assert.equal(condensedGateBar(gateMarks(run({ path: [] }))), "", "a summarized run has no path");
}

// SCN-018: shared artwork, blink cadence, bounded gestures and still pose.
const wellFormed = svg => { const stack = []; for (const match of svg.matchAll(/<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/gu)) {
  const [, close, name, self] = match; if (self) continue; if (close) { if (stack.pop() !== name) return false; } else stack.push(name); } return stack.length === 0; };
for (const mood of Object.keys(FIGURE_TEXT)) {
  const moving = figureSvg(mood, { title: 'AGDF <x> & "y"', gate: "QA", gesture: true });
  const still = figureSvg(mood, { still: true, gate: "QA", gesture: true });
  assert.ok(wellFormed(moving) && wellFormed(still), `${mood} SVG is well-formed`);
  assert.match(still, /url\(#metal\).*url\(#visor\)/su);
  assert.match(still, /data-crew="vest"/u);
  assert.match(still, /data-crew="headset"/u);
  assert.equal(/<animate|<set\b/u.test(still), false, `${mood} still pose has no animation`);
  assert.ok(moving.length < 131072, "Svg source stays below the host limit");
  assert.ok(moving.includes("AGDF &lt;x&gt; &amp; &quot;y&quot;"), "title is escaped");
  assert.equal(moving.match(/dur="12s" repeatCount="indefinite"/gu)?.length, 2, "both eyes blink at the same cadence");
  assert.equal(moving.match(/dur="31s" repeatCount="indefinite"/gu)?.length, 1, "quiet head motion has long unequal pauses");
  assert.equal(moving.includes('repeatCount="1"'), ["baut", "wartet", "blockiert", "fertig"].includes(mood));
  assert.ok(FIGURE_TEXT[mood], `${mood} has a terminal face`);
}
// Faces must still differ when animation is disabled, so expression is not color-only.
const stillFaces = Object.keys(FIGURE_TEXT).map(mood => figureSvg(mood, { still: true }).match(/<g fill="(#[a-f0-9]+)" stroke="\1"[\s\S]*?<\/g>\s*<path d="([^"]+)"/u)?.[2]);
assert.equal(stillFaces.filter(Boolean).length, 6);
assert.equal(new Set(stillFaces).size, 6, 'each mood has a distinct mouth shape in a still pose');
assert.match(figureSvg("wartet", { gate: "QA" }), />QA<\/text>/u);
const waitingGesture = figureSvg("wartet", { gate: "UR", gesture: true });
assert.match(waitingGesture, /values="0 160 86;-8 160 86;8 160 86;-8 160 86;0 160 86"[^>]*dur="2.4s" repeatCount="1"/u);
assert.doesNotMatch(figureSvg("wartet", { gate: "UR", still: true, gesture: true }), /<animate/u);
assert.doesNotMatch(figureSvg("wartet", { gate: "UR" }), /dur="2.4s"/u);
for (const mood of ["baut", "wartet", "fertig"]) {
  assert.match(figureSvg(mood, { gate: "UR", gesture: true }), /dur="2\.4s" repeatCount="1"/u, `${mood} transition has an observable duration`);
  assert.doesNotMatch(figureSvg(mood, { gate: "UR", gesture: true, still: true }), /<animate/u);
}
assert.doesNotMatch(figureSvg("wartet", { gate: "</text><script>" }), /<text|<script/u);
for (const mood of ["laeuft", "wartet", "blockiert"]) {
  const plan = figureSvg(mood, { workGate: "TP", still: true, gate: "TP" });
  assert.ok(wellFormed(plan));
  assert.match(plan, /data-accessory="tp-plan"/u);
  assert.match(plan, /data-tool="planning-pen"/u);
  assert.doesNotMatch(plan, /<animate/u);
  assert.match(figureSvg(mood, { workGate: "TP" }), /dur="29s"/u);
  assert.doesNotMatch(figureSvg(mood, { workGate: "SD" }), /data-accessory="tp-plan"/u);
}
assert.match(figureSvg("blockiert", { workGate: "TP" }), /#ff9b8c/u);
const showcase = figureSvg("laeuft", { workGate: "TP", showcase: true });
assert.match(showcase, /data-accessory="tp-plan"/u);
assert.match(showcase, /-7 155 80[^>]*dur="4s" repeatCount="indefinite"/u);
assert.doesNotMatch(figureSvg("laeuft", { workGate: "TP", showcase: true, still: true }), /<animate/u);
const warningGesture = figureSvg("blockiert", { gesture: true });
assert.match(warningGesture, /-10 112 95;-50 112 95;-28 112 95;-50 112 95;-10 112 95[^>]*dur="2\.4s" repeatCount="1"/u, "warning waves twice over a visible, bounded interval");
assert.match(warningGesture, /type="rotate" values="0 0 0;360 0 0"[^>]*dur="1s" repeatCount="1"/u, "warning symbol rotates once");
assert.doesNotMatch(figureSvg("blockiert", { still: true, gesture: true }), /<animate/u, "reduced motion stays still");
assert.equal(view({ snapshot: snapshot([structured("TP")]), showRunState: true }).workGate, "TP");
assert.equal(view({ snapshot: snapshot([structured("TP")], { stale: { failedAt: 1 } }), showRunState: true }).workGate, undefined);
assert.equal(FIGURE_TEXT.baut, "(o_o) ⚒");
assert.match(figureSvg("baut", { still: true }), /data-tool="torque-wrench"/u);
assert.doesNotMatch(figureSvg("wartet", { still: true }), /data-tool="torque-wrench"/u);
assert.match(figureSvg("fertig", { still: true }), /data-accessory="finish-flag"/u);
assert.doesNotMatch(figureSvg("fertig", { still: true, gesture: true }), /<animate/u);
assert.doesNotMatch(figureSvg("baut", { still: true }), /data-accessory="finish-flag"/u);
assert.equal(deriveFigureState(entry({ lifecycle: "completed", completion_confirmed: false })).mood, "bereit");
assert.notEqual(deriveFigureState(entry({ status: "pass", lifecycle: "active" })).mood, "fertig");
assert.equal(deriveFigureState(entry({ lifecycle: "completed", completion_confirmed: true })).mood, "fertig");

const approvalFigure = { mood: "wartet", reason: { key: "waitingApproval", gate: "QA" } };
const buildFigure = { mood: "baut", reason: { key: "building", gate: "CD+Tests" } };
const observe = (previous, figure, { current = true, scope = "project/run-a" } = {}) =>
  observeFigure(previous, { figure, current, scope });
const warning = { mood: "blockiert", reason: { key: "blocked" } };
const firstWarning = observe(null, warning);
assert.equal(firstWarning.gesture, true, "first visible warning plays once");
assert.equal(observe(firstWarning, structuredClone(warning)), firstWarning, "unchanged data does not replay");
assert.equal(observe(firstWarning, warning, { scope: "project/run-b" }).gesture, true, "a different warning run is a new display");
const hiddenWarning = observe(null, warning, { current: false });
assert.equal(hiddenWarning.gesture, false, "unavailable or reduced-motion display stays still");
assert.equal(observe(hiddenWarning, warning).gesture, true, "first current display plays the warning");
const hiddenAgain = observe(firstWarning, warning, { current: false });
assert.equal(observe(hiddenAgain, warning).gesture, false, "return from a temporary hidden state does not replay");
for (const figure of [buildFigure, approvalFigure, { mood: "fertig", reason: { key: "completed" } }]) {
  const first = observe(null, figure);
  assert.equal(first.gesture, true, `${figure.mood} plays on first display`);
  assert.equal(observe(first, structuredClone(figure)), first, `${figure.mood} does not replay on refresh`);
  const hidden = observe(null, figure, { current: false });
  assert.equal(hidden.gesture, false);
  assert.equal(observe(hidden, figure).gesture, true, `${figure.mood} plays on first current display`);
  const stale = observe(first, figure, { current: false });
  assert.equal(observe(stale, figure).gesture, false, `${figure.mood} does not replay on visibility recovery`);
}
const baseline = observe(null, approvalFigure);
assert.equal(baseline.gesture, true, "first approval observation plays the gesture");
assert.equal(baseline.gate, "QA");
const transitioned = observe(baseline, buildFigure);
assert.equal(transitioned.gesture, true);
const finished = observe(transitioned, { mood: "fertig", reason: { key: "completed" } });
assert.equal(finished.gesture, true, "a confirmed completion waves the finish flag once");
assert.equal(observe(finished, { mood: "fertig", reason: { key: "completed" } }), finished, "the same completion does not replay");
assert.match(figureSvg("fertig", { gesture: true }), /repeatCount="1"/u);
assert.equal(observe(transitioned, structuredClone(buildFigure)), transitioned, "same state keeps the image source");
assert.equal(observe(transitioned, { ...buildFigure, reason: { ...buildFigure.reason, decision: "updated" } }).gesture, false, "metadata updates do not replay a gesture");
assert.equal(observe(baseline, { mood: "wartet", reason: { key: "waitingApproval", gate: "UAT" } }).gesture, true, "a different approval is a meaningful transition");
assert.equal(observe(transitioned, approvalFigure, { scope: "project/run-b" }).gesture, true);
const stale = observe(transitioned, buildFigure, { current: false });
assert.equal(stale.gesture, false);
assert.equal(observe(stale, approvalFigure).gesture, false, "recovery seeds the current state");
assert.equal(observe(transitioned, undefined), null);

// Follow-up SCN-008: toasts only for transitions of the same run into or within wartet and blockiert.
const seen = (runId, item) => observedRun({ snapshot: snapshot([{ ...item, id: runId, updatedAt: "2026-10-26T08:01:00Z" }]), sessionStartedAt: Date.parse("2026-10-26T08:00:00Z") });
const working = run();
const waitingSd = run({ missing_approval: "Approval: SD" });
const waitingQa = run({ current_gate: "QA", missing_approval: "Approval: QA" });
const blockedRevise = structured("CR", { status: "blocked", blocking_reason: "qa_revise_required", blocking_text: "Überarbeitung nötig" });
const blockedBlock = structured("CR", { status: "blocked", blocking_reason: "AGDF_SD_DECISIONS_OPEN", blocking_text: "blocked" });
const steps = [];
let observation = null;
for (const [observed, name] of [[seen("a", waitingSd), "baseline"], [seen("a", waitingSd), "equal read"], [seen("a", working), "approved"],
  [seen("a", waitingQa), "waiting"], [seen("a", waitingQa), "equal read"], [{ kind: "unreadable" }, "unreadable"], [seen("a", waitingQa), "same after unreadable"],
  [seen("a", blockedRevise), "blocked"], [seen("a", blockedBlock), "decision changed"], [seen("b", waitingSd), "run switch"],
  [seen("b", structured("CD+Tests")), "building"], [seen("b", run({ lifecycle: "completed" })), "done"], [{ kind: "idle" }, "no run"],
  [seen("b", waitingSd), "baseline after no run"]]) {
  const result = observeNotice(observation, observed);
  observation = result.observation;
  steps.push([name, result.notice?.mood ?? null]);
}
assert.deepEqual(steps, [["baseline", null], ["equal read", null], ["approved", null], ["waiting", "wartet"], ["equal read", null], ["unreadable", null],
  ["same after unreadable", null], ["blocked", "blockiert"], ["decision changed", "blockiert"], ["run switch", null], ["building", null], ["done", null],
  ["no run", null], ["baseline after no run", null]]);
assert.equal(observeNotice(null, seen("a", waitingQa)).notice, null, "the first observation is a baseline");
// Review finding 1: a run whose evaluation failed is shown as blocked in the pane and the status line,
// but raises no toast: the catalog has no notice text for it, so the toast would read the raw key.
const unreadableRun = run({ evaluated: false, evaluation_error: "resource_limit" });
assert.deepEqual(unreadableRun.figure, { mood: "blockiert", reason: { key: "unreadable", reason: "resource_limit" } });
const afterWorking = observeNotice(observeNotice(null, seen("a", working)).observation, seen("a", unreadableRun));
assert.equal(afterWorking.notice, null, "an unreadable run raises no state toast");
for (const key of ["waitingApproval", "waitingDecision", "blocked"]) for (const locale of ["de", "en"]) {
  assert.notEqual(label(labels, locale, `notices.${key}`), `notices.${key}`, `every announced reason has a notice text (${key}, ${locale})`);
}
assert.notEqual(observeNotice(afterWorking.observation, seen("a", blockedRevise)).notice, null, "a block after the unreadable state is announced");
// Review finding 3: one run whose evaluation ran into the read budget stays that run's problem; the
// other runs are shown. A run read while its files changed still keeps the last good view (RV-1).
const slow = snapshotFromRunView(JSON.stringify({ schema_version: "run-view/1", root: "/p", language: "de", store: { status: "ok", reason: null },
  diagnosis: { unreadable: [], counts: { unreadable: 0, readable: 2, by_reason: {} } }, authorizes: false,
  runs: [{ ...entry(), run_id: "fast", figure: deriveFigureState(entry()) },
    { ...entry(), run_id: "slow", evaluated: false, evaluation_error: "timeout", figure: { mood: "blockiert", reason: { key: "unreadable", reason: "timeout" } } }] }), { now: 1 });
assert.deepEqual([slow.status, slow.runs.map(item => [item.id, item.figure.mood])], ["ok", [["fast", "laeuft"], ["slow", "blockiert"]]],
  "a single run's timeout does not discard the view");
assert.equal(slow.retry, true, "a view with a timed-out run is read again at the next check");
assert.equal(snapshotFromRunView(JSON.stringify({ schema_version: "run-view/1", root: "/p", store: { status: "ok", reason: null },
  runs: [{ ...entry(), figure: deriveFigureState(entry()) }] }), { now: 1 }).retry, false);
// Review finding 5 (adapter part): a completed run that evaluates as blocked shows the block and its next step.
const completedBlocked = run({ lifecycle: "completed", status: "blocked", current_gate: "OR", blocking_reason: "AGDF_CLOSEOUT_EVIDENCE_MISSING",
  blocking_text: "Abschluss-Evidenz fehlt", next_step_text: "Die Abschluss-Evidenz erfassen." });
const completedBlockedView = view({ snapshot: snapshot([{ ...completedBlocked, updatedAt: "2026-10-26T08:01:00Z" }]) });
assert.deepEqual([completedBlockedView.mood, completedBlockedView.nextStep], ["blockiert", "Die Abschluss-Evidenz erfassen."]);
assert.equal(view({ snapshot: snapshot([{ ...run({ lifecycle: "completed", next_step_text: "x" }), updatedAt: "2026-10-26T08:01:00Z" }]) }).nextStep, null,
  "a completed run names no next step");
assert.notEqual(observeNotice(observeNotice(null, seen("a", waitingSd)).observation, seen("a", waitingQa)).notice, null, "a new pending gate is announced");
assert.deepEqual(observedRun({ snapshot: { status: "failed", runs: [], unreadable: [], readAt: 1 }, sessionStartedAt: 0 }), { kind: "unreadable" });
assert.deepEqual(observedRun({ snapshot: { status: "unavailable", reason: "control_layout_unsupported", runs: [], unreadable: [], readAt: 1 }, sessionStartedAt: 0 }), { kind: "unreadable" });
assert.deepEqual(observedRun({ snapshot: { ...snapshot([]), unreadable: [{ id: "x", reason: "run_state_invalid" }] }, sessionStartedAt: 0, selection: "x" }), { kind: "unreadable" });
assert.deepEqual(observedRun({ snapshot: null, sessionStartedAt: 0 }), { kind: "idle" });
assert.deepEqual(observedRun({ snapshot: { status: "no_control", root: "/p", runs: [], unreadable: [], readAt: 1 }, sessionStartedAt: 0 }), { kind: "idle" });
// A notice concerns the run the status line follows and names no run (owner request of 2026-11-06, T-013).
const notice = (item, locale = "de") => noticeText(seen("r1", item).state, { registry, labels, locale });
assert.equal(notice(waitingSd), "Wartet auf Freigabe: Lösungsdesign");
assert.equal(notice(blockedRevise), "Blockiert: Code-Review – Überarbeitung nötig");
assert.equal(notice(run({ current_gate: "UAT", user_action_required: "yes" })), "Wartet auf Entscheidung: Nutzerabnahme");
assert.equal(notice(waitingQa, "en"), "Waiting for approval: Quality assurance");
assert.equal(notice(blockedBlock, "en"), "Blocked: Code review – blocked");

// Follow-up SCN-013: status-line texts per state and locale.
const status = (observed, locale = "de") => statusText(observed, { labels, locale });
assert.deepEqual([status(seen("a", waitingQa)), status(seen("a", structured("CR"))), status(seen("a", working)), status(seen("a", blockedRevise)),
  status(seen("a", run({ lifecycle: "completed" }))), status({ kind: "idle" }), status({ kind: "unreadable" })],
["AGDF · QA · wartet", "AGDF · CR · baut", "AGDF · SD · läuft", "AGDF · CR · blockiert", "AGDF · fertig", "AGDF · bereit", "AGDF · nicht lesbar"]);
assert.deepEqual([status(seen("a", waitingQa), "en"), status({ kind: "idle" }, "en"), status({ kind: "unreadable" }, "en")], ["AGDF · QA · waiting", "AGDF · idle", "AGDF · unreadable"]);

// Follow-up SCN-018: one brand name in every locale; the command name is unchanged.
for (const [locale, pack] of Object.entries(labels.locales)) {
  assert.equal(pack.title, "AGDF Companion", `${locale} title`);
  for (const key of ["description", "enabled", "disabled", "waiting"]) assert.ok(pack.command[key].includes("AGDF Companion"), `${locale} command.${key} names the brand`);
}
assert.ok(!/Begleiter|companion\b/u.test(JSON.stringify(labels)), "no other brand spelling in the companion's texts");

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

// Follow-up SCN-021 (logic part): Claude's language setting chooses the locale only without AGDF
// config: a supported tag or a language name, else the fallback.
for (const [setting, expected] of [["de", "de"], ["de-AT", "de"], ["German", "de"], ["deutsch", "de"], [" Deutsch ", "de"], ["English", "en"], ["en-GB", "en"],
  ["japanese", "en"], ["fr", "en"], ["", "en"], [null, "en"], [42, "en"]]) {
  assert.equal(chatLocale(registry, null, { setting, labels }), expected, `setting ${JSON.stringify(setting)}`);
}
assert.equal(settingLocale(registry, labels, "Klingon"), null);
assert.equal(chatLocale(registry, JSON.stringify({ chat_language: "en" }), { setting: "de", labels }), "en", "an AGDF config wins over the setting");

// SCN-008 (restored, CR finding C1): the companion's chat language, which it hands to `run-view
// --language`, agrees with the status card's Core rule; Core rejects an invalid configuration without
// repairing it, while the display-only companion never gains execution authority from it.
{
  const configRoot = mkdtempSync(join(tmpdir(), "agdf-companion-locale-"));
  try {
    const languageConfig = chat_language => JSON.stringify({ control_layout: "run-folders-v1", artifact_language: "en", chat_language, runtime_language: "en" });
    for (const config of [null, ...["de", "de-AT", "fr", "DE"].map(languageConfig)]) {
      rmSync(join(configRoot, ".agdf"), { recursive: true, force: true });
      if (config !== null) { mkdirSync(join(configRoot, ".agdf", "control"), { recursive: true }); writeFileSync(join(configRoot, ".agdf", "control", "config.json"), config); }
      assert.equal(chatLocale(registry, config), resolveConfiguredChatLanguage(configRoot), `chat language parity for ${config}`);
    }
    for (const [config, field] of [["{", "config"], [JSON.stringify({ control_layout: "run-folders-v1", chat_language: "de" }), "artifact_language"], [languageConfig("not a tag"), "chat_language"]]) {
      const path = join(configRoot, ".agdf", "control", "config.json");
      writeFileSync(path, config);
      assert.throws(() => resolveConfiguredChatLanguage(configRoot), error => error.code === "configuration_invalid"
        && error.facts.dispatch === "not_dispatched" && error.diagnostic.field === field, `invalid config must not silently default: ${config}`);
      assert.equal(readFileSync(path, "utf8"), config, "language lookup never repairs invalid project configuration");
    }
  } finally {
    rmSync(configRoot, { recursive: true, force: true });
  }
}

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
    run({ run_id: "named", last_activity: "2026-10-28T07:00:00.000Z" }),
    run({ run_id: "changed", last_activity: "2026-10-28T08:05:00.000Z" }),
    run({ run_id: "picked", last_activity: "2026-10-28T07:30:00.000Z" }),
    run({ run_id: "done", lifecycle: "completed", last_activity: "2026-10-28T07:10:00.000Z" }),
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

// Companion core SDD-007: the journal reader keeps a cursor, skips foreign and malformed lines, compares
// roots normalized and falls back to the event time after a rotation; review facts stay bounded.
{
  const { EVENT_KINDS, TOAST_KINDS, eventText, latestReview, normalizeRoot, parseJournal, sameRoot, shortRunId, unseenEvents } = await companion("events.mjs");
  const coreEvents = await import(pathToFileURL(join(repoRoot, "packages", "core", "lib", "companion", "events.js")).href);
  assert.deepEqual([EVENT_KINDS, TOAST_KINDS], [coreEvents.EVENT_KINDS, coreEvents.TOAST_KINDS], "the companion reads the kinds Core writes");
  // CR finding CIR-04: every companion mirror of a Core value is pinned to its owner.
  const mirror = await companion("events.mjs");
  const coreJournal = await import(pathToFileURL(join(repoRoot, "packages", "core", "lib", "companion", "journal.js")).href);
  assert.deepEqual([mirror.JOURNAL_FILE, mirror.JOURNAL_ROTATED_FILE, mirror.journalDirectory("D")],
    [coreJournal.JOURNAL_FILE, coreJournal.JOURNAL_ROTATED_FILE, `D/${coreJournal.JOURNAL_DIRECTORY}`], "the companion reads the files Core writes");
  assert.ok(mirror.JOURNAL_READ_LIMIT >= coreJournal.JOURNAL_LIMIT_BYTES, "the bounded read covers a full journal file");
  const coreFigure = await import(pathToFileURL(join(repoRoot, "packages", "core", "lib", "companion", "figure-state.js")).href);
  const coreIdentity = await import(pathToFileURL(join(repoRoot, "packages", "core", "lib", "control-state", "run-identity.js")).href);
  const coreOperations = await import(pathToFileURL(join(repoRoot, "packages", "core", "lib", "control-state", "run-operations.js")).href);
  assert.deepEqual(BUILD_GATES, coreFigure.BUILD_GATES, "the gate bar's build phase is Core's building phase");
  assert.deepEqual(coreIdentity.RUN_MODES.filter(isStructured), coreFigure.STRUCTURED_MODES, "structured routes as Core names them");
  assert.deepEqual(coreFigure.ENDED_LIFECYCLES, coreOperations.ENDED_LIFECYCLES, "the figure's ended lifecycles are the run lifecycle owner's");
  const catalog = await import(pathToFileURL(join(repoRoot, "packages", "core", "lib", "interaction-catalog.js")).href);
  const classification = await import(pathToFileURL(join(repoRoot, "packages", "core", "lib", "control-inspect", "run-classification.js")).href);
  const runView = await import(pathToFileURL(join(repoRoot, "packages", "core", "lib", "companion", "run-view.js")).href);
  assert.deepEqual([...catalog.COMPANION_UNREADABLE_REASONS].sort(),
    [...new Set([...runView.DIAGNOSIS_REASONS, ...classification.BOUNDED_READ_CODES, ...READ_FAILURE_REASONS])].sort(),
    "the catalog has a text for every reason the run view, the bounded read and the companion produce");
  for (const [left, right] of [["C:\\Work\\App", "c:/work/app/"], ["\\\\Server\\Share\\App", "//server/share/app"], ["/home/Work/App", "/home/work/app"],
    ["/home/Work/App/", "/home/Work/App"], ["C:\\Work\\App", "C:\\Work\\Other"], ["P:\\", "p:\\"], ["P:", "p:/"]]) {
    const win32 = /^(?:[a-z]:(?:[\\/]|$)|[\\/]{2})/iu.test(left);
    assert.equal(mirror.sameRoot(left, right), coreEvents.sameRoot(left, right, { win32 }), `root comparison ${left} | ${right}`);
  }
  const ev = (id, at, fields = {}) => ({ schema_version: "companion-event/1", id, at, root: "C:\\Work\\App", run_id: "r1", gate: "SD", kind: "approval_requested", ...fields });
  const text = [JSON.stringify(ev("a", "2026-11-05T10:00:00.000Z")), "{\"cut", JSON.stringify({ ...ev("x", "t"), schema_version: "companion-event/2" }),
    JSON.stringify(ev("b", "2026-11-05T10:00:01.000Z", { root: "c:/work/app/" })), JSON.stringify(ev("c", "2026-11-05T10:00:02.000Z", { root: "D:\\Other" }))].join("\n");
  const events = parseJournal(text);
  assert.deepEqual(events.map(item => item.id), ["a", "b", "c"]);
  assert.deepEqual(coreEvents.parseEventLines(text).map(item => item.id), ["a", "b", "c"], "the companion parses like Core");
  assert.equal(normalizeRoot("C:\\Work\\App\\"), "c:/work/app");
  assert.equal(normalizeRoot("/home/Work/App/"), "/home/Work/App", "POSIX roots keep their case");
  assert.ok(sameRoot("C:\\Work\\App", "c:/work/app/") && !sameRoot("/a", "/A") && !sameRoot("", ""));
  assert.deepEqual(unseenEvents(events, { root: "C:\\Work\\App", cursor: null }), { fresh: [], cursor: { id: "c", at: "2026-11-05T10:00:02.000Z" } }, "a first read is a baseline");
  assert.deepEqual(unseenEvents(events, { root: "C:\\Work\\App", cursor: { id: "a", at: "x" } }).fresh.map(item => item.id), ["b"], "after the cursor, this root only");
  assert.deepEqual(unseenEvents(events, { root: "C:\\Work\\App", cursor: { id: "gone", at: "2026-11-05T10:00:00.500Z" } }).fresh.map(item => item.id), ["b"], "a rotated cursor falls back to time");
  assert.deepEqual(unseenEvents([], { root: "/p", cursor: { id: null, at: "t" } }), { fresh: [], cursor: { id: null, at: "t" } });
  const tEn = (path, params) => label(labels, "en", path, params);
  // Owner request of 2026-11-06 (T-013): the shown run's events name no run; another run follows the
  // event text by its objective, else by its short id, so a cut line keeps the event.
  assert.equal(eventText(ev("a", "t", { kind: "write_rejected", reason: "stale_revision" }), tEn), "Call rejected (stale_revision) · r1");
  assert.equal(eventText(ev("a", "t"), tEn, { gateTitle: () => "Solution design", shownRunId: "r1" }), "Approval requested for Solution design",
    "the shown run's event names no run");
  assert.equal(eventText(ev("a", "t"), tEn, { gateTitle: () => "Solution design", shownRunId: "r2", runs: [{ id: "r1", objective: "Ship the export" }] }),
    "Approval requested for Solution design · Ship the export", "another run is named by its objective");
  assert.equal(eventText(ev("a", "t", { run_id: "run-4ee7b956-7ccc-4da0-97df-1f9415a483e0" }), tEn, { shownRunId: "r1" }), "Approval requested for SD · run-4ee7b956",
    "a generated id without an objective is shortened");
  assert.deepEqual(["run-4ee7b956-7ccc-4da0-97df-1f9415a483e0", "fixture-a", "run-4ee7b956"].map(shortRunId), ["run-4ee7b956", "fixture-a", "run-4ee7b956"]);
  const review = latestReview([ev("a", "t", { kind: "material_staged", review: [{ slot: "SD", digest: `sha256:${"f".repeat(64)}`, bytes: 9, preview: "x", truncated: true, source_match: "guess" }] })], tEn);
  assert.deepEqual(review, { summary: "SD: 9 bytes, sha256:ffffffff…", match: "facts unavailable", preview: "x", truncated: "preview truncated" }, "an unknown match is unavailable");
  assert.equal(latestReview([ev("a", "t")], tEn), null);
  for (const kind of EVENT_KINDS) for (const locale of ["de", "en"]) assert.notEqual(label(labels, locale, `events.${kind}`), `events.${kind}`, `${locale} text for ${kind}`);
  // The view lists the events with their time, the newest review and the unavailable hint.
  const shown = view({ snapshot: snapshot([run({ last_activity: "2026-10-26T08:01:00Z", drift: [{ document: "SD", path: "p", recorded_digest: `sha256:${"1".repeat(64)}`, current_digest: null }] })]),
    events: [ev("b", "2026-11-05T10:00:01.000Z", { kind: "effect_unknown", run_id: "r" }), ev("c", "2026-11-05T10:00:00.000Z", { kind: "write_rejected", reason: "stale_revision" })],
    eventsAvailable: false });
  assert.deepEqual(shown.events.map(line => line.slice(6)), ["Wirkung unbekannt – Vorgangsstatus prüfen", "Aufruf abgelehnt (stale_revision) · r1"],
    "the shown run's event names no run; another run's event names it after the text");
  const pair = view({ snapshot: snapshot([run({ run_id: "a", objective: "First run" }), run({ run_id: "b", objective: "Second run" })]),
    events: [ev("d", "2026-11-05T10:00:02.000Z", { run_id: "b" }), ev("e", "2026-11-05T10:00:01.000Z", { run_id: "a" })] });
  assert.deepEqual([pair.runId, pair.events.map(line => line.slice(6))], ["a", ["Freigabe angefragt für Lösungsdesign · Second run", "Freigabe angefragt für Lösungsdesign"]],
    "an event of another open run names it by its objective");
  assert.equal(shown.eventsHint, "Ereignisse nicht verfügbar; der Run-Status wird weiter gelesen.");
  assert.deepEqual(shown.drift, ["SD wurde nach der Erfassung geändert (erfasst sha256:11111111…, jetzt –). Aus der aktuellen Datei neu erfassen oder die Datei wiederherstellen."]);
  assert.ok(terminalText(shown, { labels, locale: "de" }).includes("Ereignisse:\n"));

  // CR finding B10: the terminal text shows the start of the preview beneath the material line.
  const previewed = view({ snapshot: snapshot([run({ last_activity: "2026-10-26T08:01:00Z" })]),
    events: [ev("p", "2026-11-05T10:00:03.000Z", { kind: "material_staged", review: [{ slot: "UR", digest: `sha256:${"a".repeat(64)}`, bytes: 30,
      preview: "# UR\nLine two\nLine three\nLine four", truncated: false, source_match: "not_determinable" }] })] });
  const terminal = terminalText(previewed, { labels, locale: "en" });
  assert.ok(terminal.includes("\n  # UR\n  Line two\n  Line three\n"), terminal);
  assert.ok(!terminal.includes("Line four"), "the terminal shows a bounded start of the preview");

  // CR findings B4 and B7: durable facts need the run view's confirmation; an uncertain outcome stands
  // until its run recorded a later operation.
  const { isConfirmed, isStillUncertain } = await companion("events.mjs");
  const runs = [{ id: "r1", lifecycle: "active", updatedAt: "2026-11-05T10:00:05.000Z", path: [{ gate: "UR", status: "fulfilled" }, { gate: "PRD", status: "open" }] },
    { id: "r2", lifecycle: "completed", updatedAt: "2026-11-05T09:00:00.000Z", path: [] }];
  assert.deepEqual([
    isConfirmed(ev("a", "t", { kind: "approval_recorded", gate: "UR" }), runs),
    isConfirmed(ev("a", "t", { kind: "approval_recorded", gate: "PRD" }), runs),
    isConfirmed(ev("a", "t", { kind: "run_completed", run_id: "r2" }), runs),
    isConfirmed(ev("a", "t", { kind: "run_completed" }), runs),
    isConfirmed(ev("a", "t", { kind: "approval_recorded", run_id: "gone" }), runs),
    isConfirmed(ev("a", "t", { kind: "write_rejected" }), []),
  ], [true, false, true, false, false, true]);
  assert.deepEqual([
    isStillUncertain(ev("a", "2026-11-05T10:00:06.000Z", { kind: "effect_unknown" }), runs),
    isStillUncertain(ev("a", "2026-11-05T10:00:04.000Z", { kind: "effect_unknown" }), runs),
    isStillUncertain(ev("a", "2026-11-05T10:00:04.000Z", { kind: "recovery_required", run_id: "gone" }), runs),
    isStillUncertain(ev("a", "2026-11-05T10:00:06.000Z", { kind: "write_rejected" }), runs),
  ], [true, false, true, false]);
}

console.log("Claude companion logic tests passed");
